import type { Payment } from '@prisma/client';
import { PaymentRepository } from '@/repositories/payment.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { PlanRepository } from '@/repositories/plan.repository';
import { PaymentMethodRepository } from '@/repositories/payment-method.repository';
import { NotFoundError, ValidationError } from '@/lib/errors/errors';
import { assertPaymentMethodActive } from './payment-method-guard';

export interface InstapaySubmission {
  paymentId: string;
  restaurantName: string;
  itemName: string;
  amountCents: number;
  currencyCode: string;
}

interface InstapayTarget {
  planKey: string | null;
  themeId: string | null;
  itemName: string;
  amountCents: number;
  rawWebhookPayload:
    | { kind: 'instapay_pending'; planKey: string }
    | { kind: 'instapay_theme_pending'; themeKey: string; themeId: string };
}

/**
 * InstaPay (manual bank transfer) payments: the owner submits an intent, the admin
 * verifies the transfer screenshot out of band and confirms it here.
 */
export class ManualPaymentService {
  constructor(
    private readonly payments: PaymentRepository = new PaymentRepository(),
    private readonly restaurants: RestaurantRepository = new RestaurantRepository(),
    private readonly themes: ThemeRepository = new ThemeRepository(),
    private readonly plans: PlanRepository = new PlanRepository(),
    private readonly paymentMethods: PaymentMethodRepository = new PaymentMethodRepository(),
  ) {}

  /**
   * Register an InstaPay manual payment intent. Creates a PENDING record in the DB
   * so the admin can identify and activate the plan after verifying the screenshot.
   */
  public async submitInstapay(input: {
    userId: string;
    restaurantId: string;
    planKey?: string;
    themeKey?: string;
  }): Promise<InstapaySubmission> {
    await assertPaymentMethodActive(this.paymentMethods, 'instapay');
    const restaurant = await this.restaurants.findByOwnerId(input.userId);
    if (!restaurant || restaurant.id !== input.restaurantId) throw new NotFoundError('Restaurant');
    const target = input.planKey
      ? await this.planTarget(input.planKey)
      : await this.themeTarget(input.themeKey);
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

  /** Admin confirmation: mark SUCCESS, then activate the plan or theme the payment was for. */
  public async confirmManualPayment(paymentId: string): Promise<Payment> {
    const payment = await this.payments.findById(paymentId);
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status !== 'PENDING') throw new ValidationError('Only PENDING payments can be confirmed');
    await this.payments.updateStatus(payment.id, 'SUCCESS', { kind: 'manual_instapay_confirmed' });
    const planKey = await this.payments.findPlanKeyFor(payment.id);
    if (planKey) {
      await this.restaurants.activatePlan(payment.restaurantId, planKey);
      return this.reload(paymentId);
    }
    const themeId = await this.payments.findThemeIdFor(payment.id);
    if (themeId) {
      await this.restaurants.updateTheme(payment.restaurantId, themeId);
      return this.reload(paymentId);
    }
    throw new ValidationError('Payment is missing a plan or theme target');
  }

  private async reload(paymentId: string): Promise<Payment> {
    const refreshed = await this.payments.findById(paymentId);
    if (!refreshed) throw new NotFoundError('Payment');
    return refreshed;
  }

  private async planTarget(planKey: string): Promise<InstapayTarget> {
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

  private async themeTarget(themeKey: string | undefined): Promise<InstapayTarget> {
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
