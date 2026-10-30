import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Payment } from '@prisma/client';
import { PaymentService } from './payment.service';
import { NotFoundError, ValidationError } from '@/lib/errors/errors';
import { activeMethods, paymentRepoMock, paymentRow, restaurantRepoMock } from '../../tests/payment-mocks';

vi.mock('./payment-emails', () => ({
  sendReceiptEmail: vi.fn(async () => undefined),
  sendRefundEmail: vi.fn(async () => undefined),
}));

const SUCCESS = { id: 555, order: { id: 123456 }, success: true, pending: false };
const DECLINED = { id: 556, order: { id: 123456 }, success: false, pending: false };

function build(payment: Payment | null, extras: { restaurant?: Record<string, unknown>; methods?: ReturnType<typeof activeMethods> } = {}) {
  const payments = paymentRepoMock(payment);
  const restaurants = restaurantRepoMock(extras.restaurant ?? null);
  const themes = {
    findById: vi.fn(async (id: string) => ({ id, isActive: true, isFree: false, priceCents: 9900 })),
    findByKey: vi.fn(async () => ({ id: 'theme-classic', key: 'classic' })),
  };
  const paymob = {
    createCheckout: vi.fn(async () => ({ providerOrderId: 'po-1', iframeUrl: 'https://accept.paymob.com/iframe/1' })),
    refund: vi.fn(async () => ({ success: true, refundTransactionId: 'rf-1' })),
  };
  const plans = { findByKey: vi.fn(async (key: string) => ({ key, name: 'Studio', monthlyPriceCents: 25000 })) };
  const service = new PaymentService(
    payments as never,
    restaurants as never,
    themes as never,
    paymob as never,
    {} as never,
    plans as never,
    (extras.methods ?? activeMethods('CARD', 'APPLE_PAY', 'INSTAPAY')) as never,
  );
  return { service, payments, restaurants, themes, paymob, plans };
}

describe('PaymentService.handlePaymobWebhook', () => {
  it('audits the event before anything else, even for unknown orders', async () => {
    const { service, payments } = build(null);
    await expect(service.handlePaymobWebhook(SUCCESS)).rejects.toThrow(NotFoundError);
    expect(payments.recordWebhookEvent).toHaveBeenCalledWith(expect.objectContaining({
      paymentId: null, providerOrderId: '123456', hmacValid: true,
    }));
  });

  it('activates the plan on a successful plan-upgrade payment', async () => {
    const { service, payments, restaurants } = build(paymentRow({ planKey: 'studio' }));
    await service.handlePaymobWebhook(SUCCESS);
    expect(payments.updateStatus).toHaveBeenCalledWith('pay-1', 'SUCCESS', expect.anything(), '555');
    expect(restaurants.activatePlan).toHaveBeenCalledWith('rest-1', 'studio');
    expect(restaurants.updateTheme).not.toHaveBeenCalled();
  });

  it('switches the theme on a successful theme payment, using the stored theme_id', async () => {
    const { service, restaurants } = build(paymentRow({ themeId: 'theme-elegant' }));
    await service.handlePaymobWebhook({ ...SUCCESS, themeId: 'attacker-chosen' });
    expect(restaurants.updateTheme).toHaveBeenCalledWith('rest-1', 'theme-elegant');
  });

  it('is idempotent: a replayed webhook for a SUCCESS or REFUNDED payment changes nothing', async () => {
    for (const status of ['SUCCESS', 'REFUNDED'] as const) {
      const { service, payments, restaurants } = build(paymentRow({ status, planKey: 'studio' }));
      await service.handlePaymobWebhook(SUCCESS);
      expect(payments.recordWebhookEvent).toHaveBeenCalledOnce();
      expect(payments.updateStatus).not.toHaveBeenCalled();
      expect(restaurants.activatePlan).not.toHaveBeenCalled();
    }
  });

  it('marks a declined transaction FAILED without activating anything', async () => {
    const { service, payments, restaurants } = build(paymentRow({ planKey: 'studio' }));
    await service.handlePaymobWebhook(DECLINED);
    expect(payments.updateStatus).toHaveBeenCalledWith('pay-1', 'FAILED', expect.anything(), '556');
    expect(restaurants.activatePlan).not.toHaveBeenCalled();
  });

  it('records rejected (bad-HMAC) webhooks with hmacValid=false', async () => {
    const { service, payments } = build(null);
    await service.recordRejectedWebhook({ order: { id: 9 } });
    expect(payments.recordWebhookEvent).toHaveBeenCalledWith(expect.objectContaining({ hmacValid: false, providerOrderId: '9' }));
  });
});

describe('PaymentService checkout and refund', () => {
  let restaurant: Record<string, unknown>;
  beforeEach(() => {
    restaurant = { id: 'rest-1', planKey: 'free_trial', currencyCode: 'EGP', themeId: 'theme-elegant' };
  });

  it('creates a PENDING plan payment and returns the Paymob iframe URL', async () => {
    const { service, payments, paymob } = build(null, { restaurant });
    const result = await service.checkoutPlan({ userId: 'user-1', restaurantId: 'rest-1', planKey: 'studio', email: 'o@x.com', method: 'card' });
    expect(result).toEqual({ paid: false, redirectUrl: 'https://accept.paymob.com/iframe/1' });
    expect(payments.create).toHaveBeenCalledWith(expect.objectContaining({ amountCents: 25000, planKey: 'studio', themeId: null }));
    expect(paymob.createCheckout).toHaveBeenCalledWith(expect.objectContaining({ amountCents: 25000, method: 'card' }));
  });

  it('refuses a checkout method the admin has disabled', async () => {
    const { service, paymob } = build(null, { restaurant, methods: activeMethods('CARD') });
    await expect(service.checkoutPlan({ userId: 'user-1', restaurantId: 'rest-1', planKey: 'studio', email: 'o@x.com', method: 'applePay' }))
      .rejects.toThrow('This payment method is currently unavailable');
    expect(paymob.createCheckout).not.toHaveBeenCalled();
  });

  it("refuses to check out another owner's restaurant", async () => {
    const { service } = build(null, { restaurant });
    await expect(service.checkoutPlan({ userId: 'user-1', restaurantId: 'rest-OTHER', planKey: 'studio', email: 'o@x.com', method: 'card' }))
      .rejects.toThrow(NotFoundError);
  });

  it('only refunds SUCCESS payments and reverts the theme it activated to Classic', async () => {
    const pending = build(paymentRow());
    await expect(pending.service.refund('pay-1')).rejects.toThrow(ValidationError);

    const { service, payments, restaurants } = build(
      paymentRow({ status: 'SUCCESS', providerTransactionId: 'tx-1', themeId: 'theme-elegant' }),
      { restaurant },
    );
    await expect(service.refund('pay-1')).resolves.toEqual({ refundTransactionId: 'rf-1' });
    expect(payments.updateStatus).toHaveBeenCalledWith('pay-1', 'REFUNDED', expect.objectContaining({ refundTransactionId: 'rf-1' }));
    expect(restaurants.updateTheme).toHaveBeenCalledWith('rest-1', 'theme-classic');
  });
});
