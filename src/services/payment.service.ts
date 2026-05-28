import type { Payment, Prisma, Theme } from '@prisma/client';
import { PaymentRepository } from '@/repositories/payment.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { UserRepository } from '@/repositories/user.repository';
import { PaymobAdapter } from '@/integrations/payment/paymob.adapter';
import { NotFoundError, ValidationError } from '@/lib/errors/errors';
import { logger } from '@/lib/logger';
import type { PaymobBillingData } from '@/integrations/payment/paymob.types';
import { getMessaging } from '@/integrations/messaging/messaging.factory';
import { paymentReceiptEmail, refundEmail } from './email-templates';

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
  ) {}

  public async checkoutTheme(input: {
    userId: string;
    restaurantId: string;
    themeId: string;
    email: string;
    method: 'card' | 'applePay';
  }): Promise<CheckoutResult> {
    const restaurant = await this.restaurants.findByOwnerId(input.userId);
    if (!restaurant || restaurant.id !== input.restaurantId) throw new NotFoundError('Restaurant');
    const theme = await this.themes.findById(input.themeId);
    if (!theme || !theme.isActive) throw new NotFoundError('Theme');
    if (theme.isFree || theme.priceCents === 0) {
      await this.restaurants.updateTheme(restaurant.id, theme.id);
      return { paid: true, redirectUrl: null };
    }
    const payment = await this.createThemePayment({ ...input, currencyCode: restaurant.currencyCode }, theme);
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
      const themeId = await this.payments.findThemeIdFor(payment.id);
      if (!themeId) throw new ValidationError('Payment is missing theme_id');
      await this.payments.updateStatus(payment.id, 'SUCCESS', payloadJson(payload), transactionId);
      await this.restaurants.updateTheme(payment.restaurantId, themeId);
      await this.sendReceiptSafe(payment, themeId, transactionId).catch((err) => logger.warn({ err }, 'receipt email failed'));
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

    await this.sendRefundEmailSafe(payment, result.refundTransactionId).catch((err) => logger.warn({ err }, 'refund email failed'));
    return { refundTransactionId: result.refundTransactionId };
  }

  private async sendReceiptSafe(payment: Payment, themeId: string, transactionId: string | undefined): Promise<void> {
    const user = await this.users.findById(payment.userId);
    if (!user || !user.email) return;
    const theme = await this.themes.findById(themeId);
    const locale: 'en' | 'ar' = user.localePreference === 'ar' ? 'ar' : 'en';
    const template = paymentReceiptEmail({
      locale,
      themeName: theme?.name ?? 'Theme',
      amountCents: payment.amountCents,
      currencyCode: payment.currencyCode,
      transactionId: transactionId ?? payment.id,
    });
    await getMessaging().sendEmail({
      to: { email: user.email, name: user.name ?? undefined },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  private async sendRefundEmailSafe(payment: Payment, refundTransactionId: string): Promise<void> {
    const user = await this.users.findById(payment.userId);
    if (!user || !user.email) return;
    const locale: 'en' | 'ar' = user.localePreference === 'ar' ? 'ar' : 'en';
    const template = refundEmail({
      locale,
      amountCents: payment.amountCents,
      currencyCode: payment.currencyCode,
      refundTransactionId,
    });
    await getMessaging().sendEmail({
      to: { email: user.email, name: user.name ?? undefined },
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
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

  private createThemePayment(
    input: { userId: string; restaurantId: string; themeId: string; currencyCode: string },
    theme: Theme,
  ): Promise<Payment> {
    return this.payments.create({
      restaurantId: input.restaurantId,
      userId: input.userId,
      amountCents: theme.priceCents,
      currencyCode: input.currencyCode,
      themeId: theme.id,
      rawWebhookPayload: { kind: 'theme_checkout', themeId: input.themeId },
    });
  }
}

function billingData(email: string): PaymobBillingData {
  return {
    first_name: 'Tabla',
    last_name: 'Owner',
    email,
    phone_number: '+201000000000',
    apartment: 'NA',
    floor: 'NA',
    street: 'NA',
    building: 'NA',
    shipping_method: 'NA',
    postal_code: 'NA',
    city: 'Cairo',
    country: 'EG',
    state: 'Cairo',
  };
}

function readProviderOrderId(payload: unknown): string {
  const order = isRecord(payload) ? payload.order : null;
  if (isRecord(order) && (typeof order.id === 'number' || typeof order.id === 'string')) return String(order.id);
  throw new ValidationError('Missing Paymob order id');
}

function maybeProviderOrderId(payload: unknown): string | null {
  const order = isRecord(payload) ? payload.order : null;
  if (isRecord(order) && (typeof order.id === 'number' || typeof order.id === 'string')) return String(order.id);
  return null;
}

function readTransactionId(payload: unknown): string | undefined {
  return isRecord(payload) && (typeof payload.id === 'number' || typeof payload.id === 'string') ? String(payload.id) : undefined;
}

function isSuccess(payload: unknown): boolean {
  return isRecord(payload) && payload.success === true && payload.pending === false;
}

function payloadJson(payload: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(isRecord(payload) ? payload : {})) as Prisma.InputJsonValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
