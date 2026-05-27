import type { Payment, Prisma, Theme } from '@prisma/client';
import { PaymentRepository } from '@/repositories/payment.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { PaymobAdapter } from '@/integrations/payment/paymob.adapter';
import { NotFoundError, ValidationError } from '@/lib/errors/errors';
import type { PaymobBillingData } from '@/integrations/payment/paymob.types';

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

  public async handlePaymobWebhook(payload: unknown): Promise<void> {
    const providerOrderId = readProviderOrderId(payload);
    const payment = await this.payments.findByProviderOrderId(providerOrderId);
    if (!payment) throw new NotFoundError('Payment');
    if (payment.status === 'SUCCESS') return;
    const themeId = readThemeId(payment.rawWebhookPayload);
    if (isSuccess(payload)) {
      await this.payments.updateStatus(payment.id, 'SUCCESS', payloadJson(payload), readTransactionId(payload));
      await this.restaurants.updateTheme(payment.restaurantId, themeId);
      return;
    }
    await this.payments.updateStatus(payment.id, 'FAILED', payloadJson(payload), readTransactionId(payload));
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

function readThemeId(value: unknown): string {
  if (isRecord(value) && typeof value.themeId === 'string') return value.themeId;
  throw new ValidationError('Missing payment theme metadata');
}

function readProviderOrderId(payload: unknown): string {
  const order = isRecord(payload) ? payload.order : null;
  if (isRecord(order) && (typeof order.id === 'number' || typeof order.id === 'string')) return String(order.id);
  throw new ValidationError('Missing Paymob order id');
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
