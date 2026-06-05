import type { Payment } from '@prisma/client';
import { PaymentRepository } from '@/repositories/payment.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { PlanRepository } from '@/repositories/plan.repository';
import { UserRepository } from '@/repositories/user.repository';
import { PaymentMethodRepository } from '@/repositories/payment-method.repository';
import { PaymobAdapter } from '@/integrations/payment/paymob.adapter';
import { NotFoundError, ValidationError } from '@/lib/errors/errors';
import { METHOD_ID_TO_KEY, type PaymentMethodId } from '@/lib/payments/payment-methods';
import { logger } from '@/lib/logger';
import { sendReceiptEmail, sendRefundEmail } from './payment-emails';
import {
  billingData,
  isSuccess,
  maybeProviderOrderId,
  payloadJson,
  readProviderOrderId,
  readTransactionId,
} from './paymob-payload';

interface CheckoutResult {
  paid: boolean;
  redirectUrl: string | null;
}

export class PaymentService {
  constructor(
    private readonly payments: PaymentRepository = new PaymentRepository(),
    private readonly restaurants: RestaurantRepository = new RestaurantRepository(),
    private readonly themes: ThemeRepository = new ThemeRepository(),
    private readonly paymob: PaymobAdapter = new PaymobAdapter(),
    private readonly users: UserRepository = new UserRepository(),
    private readonly plans: PlanRepository = new PlanRepository(),
    private readonly paymentMethods: PaymentMethodRepository = new PaymentMethodRepository(),
  ) {}

  public async checkoutTheme(input: {
    userId: string;
    restaurantId: string;
    themeId: string;
    email: string;
    method: PaymentMethodId;
  }): Promise<CheckoutResult> {
    const restaurant = await this.restaurants.findByOwnerId(input.userId);
    if (!restaurant || restaurant.id !== input.restaurantId) throw new NotFoundError('Restaurant');
    const theme = await this.themes.findById(input.themeId);
    if (!theme || !theme.isActive) throw new NotFoundError('Theme');
    if (theme.isFree || theme.priceCents === 0) {
      await this.restaurants.updateTheme(restaurant.id, theme.id);
      return { paid: true, redirectUrl: null };
    }
    await this.ensurePaymentMethodActive(input.method);
    if (input.method === 'instapay') throw new ValidationError('InstaPay is only available for plan upgrades');
    const payment = await this.recordPendingPayment({
      restaurantId: input.restaurantId,
      userId: input.userId,
      amountCents: theme.priceCents,
      currencyCode: restaurant.currencyCode,
      themeId: theme.id,
      planKey: null,
    });
    const checkout = await this.paymob.createCheckout({
      paymentId: payment.id,
      amountCents: theme.priceCents,
      currencyCode: restaurant.currencyCode,
      method: input.method,
      billingData: billingData(input.email),
    });
    await this.payments.setProviderOrder(payment.id, checkout.providerOrderId);
    return { paid: false, redirectUrl: checkout.iframeUrl };
  }

  /**
   * Start a paid-plan upgrade. This is the exit door from the free trial: on a
   * successful webhook the restaurant's planKey is set and its trial deadline cleared.
   * Free plans (monthlyPriceCents 0) can't be "purchased".
   */
  public async checkoutPlan(input: {
    userId: string;
    restaurantId: string;
    planKey: string;
    email: string;
    method: PaymentMethodId;
  }): Promise<CheckoutResult> {
    await this.ensurePaymentMethodActive(input.method);
    if (input.method === 'instapay') throw new ValidationError('Use submitInstapay for InstaPay payments');
    const restaurant = await this.restaurants.findByOwnerId(input.userId);
    if (!restaurant || restaurant.id !== input.restaurantId) throw new NotFoundError('Restaurant');
    const plan = await this.plans.findByKey(input.planKey);
    if (!plan) throw new NotFoundError('Plan');
    if (plan.monthlyPriceCents <= 0) throw new ValidationError('Plan is not purchasable');
    if (restaurant.planKey === plan.key) throw new ValidationError('Already on this plan');

    const payment = await this.recordPendingPayment({
      restaurantId: input.restaurantId,
      userId: input.userId,
      amountCents: plan.monthlyPriceCents,
      currencyCode: restaurant.currencyCode,
      themeId: null,
      planKey: plan.key,
    });
    const checkout = await this.paymob.createCheckout({
      paymentId: payment.id,
      amountCents: plan.monthlyPriceCents,
      currencyCode: restaurant.currencyCode,
      method: input.method as 'card' | 'applePay',
      billingData: billingData(input.email),
    });
    await this.payments.setProviderOrder(payment.id, checkout.providerOrderId);
    return { paid: false, redirectUrl: checkout.iframeUrl };
  }

  /**
   * Handle a Paymob webhook AFTER its HMAC has already been verified by the caller.
   *
   * Idempotency: short-circuits on ANY non-PENDING terminal status. A late SUCCESS after a
   * recorded FAILED is treated as a state change because Paymob can flip a transaction; in
   * that case we update status but still use the canonical `Payment.themeId` to activate.
   *
   * Theme metadata is read from the dedicated `theme_id` column — never from the mutable
   * `rawWebhookPayload` blob, which gets overwritten by Paymob's own payloads.
   */
  public async handlePaymobWebhook(payload: unknown): Promise<void> {
    const providerOrderId = readProviderOrderId(payload);
    const payment = await this.payments.findByProviderOrderId(providerOrderId);
    // Always append-only-audit the event first.
    await this.payments.recordWebhookEvent({
      paymentId: payment?.id ?? null,
      providerOrderId,
      hmacValid: true,
      payload: payloadJson(payload),
    });
    if (!payment) throw new NotFoundError('Payment');

    if (payment.status === 'SUCCESS' || payment.status === 'REFUNDED') {
      logger.info({ paymentId: payment.id, status: payment.status }, 'paymob webhook ignored (terminal)');
      return;
    }

    const transactionId = readTransactionId(payload);

    if (isSuccess(payload)) {
      const planKey = await this.payments.findPlanKeyFor(payment.id);
      if (planKey) {
        await this.payments.updateStatus(payment.id, 'SUCCESS', payloadJson(payload), transactionId);
        await this.restaurants.activatePlan(payment.restaurantId, planKey);
        logger.info({ paymentId: payment.id, planKey }, 'plan upgrade activated, trial cleared');
        return;
      }
      const themeId = await this.payments.findThemeIdFor(payment.id);
      if (!themeId) throw new ValidationError('Payment is missing theme_id');
      await this.payments.updateStatus(payment.id, 'SUCCESS', payloadJson(payload), transactionId);
      await this.restaurants.updateTheme(payment.restaurantId, themeId);
      await sendReceiptEmail(this.users, this.themes, payment, themeId, transactionId).catch((err) => logger.warn({ err }, 'receipt email failed'));
      return;
    }

    await this.payments.updateStatus(payment.id, 'FAILED', payloadJson(payload), transactionId);
  }

  /**
   * Full refund of a successful payment.
   * Calls Paymob's refund API first; only marks the DB row REFUNDED on API success.
   * If the payment's theme is still the active theme, downgrades the restaurant back
   * to the seeded free Classic theme so the owner stops getting paid features after refund.
   */
  public async refund(paymentId: string): Promise<{ refundTransactionId: string }> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'SUCCESS') throw new ValidationError('Only SUCCESS payments can be refunded');
    if (!payment.providerTransactionId) throw new ValidationError('Payment is missing Paymob transaction id');

    const result = await this.paymob.refund({
      transactionId: payment.providerTransactionId,
      amountCents: payment.amountCents,
    });
    if (!result.success) throw new ValidationError('Paymob refused the refund');

    await this.payments.updateStatus(payment.id, 'REFUNDED', { kind: 'refund', refundTransactionId: result.refundTransactionId });

    // If the restaurant is still on the theme this payment activated, revert to Classic.
    const themeId = await this.payments.findThemeIdFor(payment.id);
    if (themeId) {
      const restaurant = await this.restaurants.findById(payment.restaurantId);
      if (restaurant && restaurant.themeId === themeId) {
        const classic = await this.themes.findByKey('classic');
        if (classic) await this.restaurants.updateTheme(payment.restaurantId, classic.id);
      }
    }

    await sendRefundEmail(this.users, payment, result.refundTransactionId).catch((err) => logger.warn({ err }, 'refund email failed'));
    return { refundTransactionId: result.refundTransactionId };
  }

  /** Record a webhook call whose HMAC failed verification — useful for monitoring abuse. */
  public async recordRejectedWebhook(payload: unknown): Promise<void> {
    await this.payments.recordWebhookEvent({
      paymentId: null,
      providerOrderId: maybeProviderOrderId(payload),
      hmacValid: false,
      payload: payloadJson(payload),
    });
  }

  /**
   * Register an InstaPay manual payment intent. Creates a PENDING record in the DB
   * so the admin can identify and activate the plan after verifying the screenshot.
   */
  public async submitInstapay(input: {
    userId: string;
    restaurantId: string;
    planKey?: string;
    themeKey?: string;
  }): Promise<{ paymentId: string; restaurantName: string; itemName: string; amountCents: number; currencyCode: string }> {
    await this.ensurePaymentMethodActive('instapay');
    const restaurant = await this.restaurants.findByOwnerId(input.userId);
    if (!restaurant || restaurant.id !== input.restaurantId) throw new NotFoundError('Restaurant');
    const target = input.planKey
      ? await this.instapayPlanTarget(input.planKey)
      : await this.instapayThemeTarget(input.themeKey);
    const payment = await this.payments.create({
      restaurantId: input.restaurantId,
      userId: input.userId,
      amountCents: target.amountCents,
      currencyCode: restaurant.currencyCode,
      themeId: target.themeId,
      planKey: target.planKey,
      rawWebhookPayload: target.rawWebhookPayload,
    });
    return {
      paymentId: payment.id,
      restaurantName: restaurant.name,
      itemName: target.itemName,
      amountCents: target.amountCents,
      currencyCode: restaurant.currencyCode,
    };
  }

  public async confirmManualPayment(paymentId: string): Promise<Payment> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'PENDING') throw new ValidationError('Only PENDING payments can be confirmed');
    await this.payments.updateStatus(payment.id, 'SUCCESS', { kind: 'manual_instapay_confirmed' });
    const planKey = await this.payments.findPlanKeyFor(payment.id);
    if (planKey) {
      await this.restaurants.activatePlan(payment.restaurantId, planKey);
      const refreshed = await this.payments.findById(paymentId);
      if (!refreshed) throw new NotFoundError('Payment');
      return refreshed;
    }
    const themeId = await this.payments.findThemeIdFor(payment.id);
    if (themeId) {
      await this.restaurants.updateTheme(payment.restaurantId, themeId);
      const refreshed = await this.payments.findById(paymentId);
      if (!refreshed) throw new NotFoundError('Payment');
      return refreshed;
    }
    throw new ValidationError('Payment is missing a plan or theme target');
  }

  /** Insert a PENDING payment for either a theme or a plan upgrade (exactly one of themeId/planKey). */
  private recordPendingPayment(input: {
    restaurantId: string;
    userId: string;
    amountCents: number;
    currencyCode: string;
    themeId: string | null;
    planKey: string | null;
  }): Promise<Payment> {
    const meta = input.themeId
      ? { kind: 'theme_checkout', themeId: input.themeId }
      : { kind: 'plan_checkout', planKey: input.planKey };
    return this.payments.create({ ...input, rawWebhookPayload: meta });
  }

  private async ensurePaymentMethodActive(method: PaymentMethodId): Promise<void> {
    const activeKeys = await this.paymentMethods.listActiveKeys();
    if (!activeKeys.includes(METHOD_ID_TO_KEY[method])) {
      throw new ValidationError('This payment method is currently unavailable');
    }
  }

  private async instapayPlanTarget(planKey: string | undefined): Promise<{
    planKey: string;
    themeId: null;
    itemName: string;
    amountCents: number;
    rawWebhookPayload: { kind: 'instapay_pending'; planKey: string };
  }> {
    if (!planKey) throw new ValidationError('Plan is required');
    const plan = await this.plans.findByKey(planKey);
    if (!plan) throw new NotFoundError('Plan');
    if (plan.monthlyPriceCents <= 0) throw new ValidationError('Plan is not purchasable');
    return {
      planKey: plan.key,
      themeId: null,
      itemName: plan.name,
      amountCents: plan.monthlyPriceCents,
      rawWebhookPayload: { kind: 'instapay_pending', planKey: plan.key },
    };
  }

  private async instapayThemeTarget(themeKey: string | undefined): Promise<{
    planKey: null;
    themeId: string;
    itemName: string;
    amountCents: number;
    rawWebhookPayload: { kind: 'instapay_theme_pending'; themeKey: string; themeId: string };
  }> {
    if (!themeKey) throw new ValidationError('Theme is required');
    const theme = await this.themes.findByKey(themeKey);
    if (!theme || !theme.isActive) throw new NotFoundError('Theme');
    if (theme.isFree || theme.priceCents <= 0) throw new ValidationError('Theme is not purchasable');
    return {
      planKey: null,
      themeId: theme.id,
      itemName: theme.name,
      amountCents: theme.priceCents,
      rawWebhookPayload: { kind: 'instapay_theme_pending', themeKey: theme.key, themeId: theme.id },
    };
  }
}
