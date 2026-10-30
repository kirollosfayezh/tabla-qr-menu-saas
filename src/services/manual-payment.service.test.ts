import { describe, expect, it, vi } from 'vitest';
import type { Payment } from '@prisma/client';
import { ManualPaymentService } from './manual-payment.service';
import { NotFoundError, ValidationError } from '@/lib/errors/errors';
import { activeMethods, paymentRepoMock, paymentRow, restaurantRepoMock } from '../../tests/payment-mocks';

const RESTAURANT = { id: 'rest-1', name: 'Cafe Nile', currencyCode: 'EGP' };

function build(payment: Payment | null, methods = activeMethods('CARD', 'INSTAPAY')) {
  const payments = paymentRepoMock(payment);
  const restaurants = restaurantRepoMock(RESTAURANT);
  const themes = { findByKey: vi.fn(async (key: string) => (key === 'elegant' ? { id: 'theme-elegant', key, name: 'Elegant', isActive: true, isFree: false, priceCents: 9900 } : null)) };
  const plans = { findByKey: vi.fn(async (key: string) => (key === 'studio' ? { key, name: 'Studio', monthlyPriceCents: 25000 } : { key, name: 'Trial', monthlyPriceCents: 0 })) };
  const service = new ManualPaymentService(payments as never, restaurants as never, themes as never, plans as never, methods as never);
  return { service, payments, restaurants };
}

describe('ManualPaymentService (InstaPay)', () => {
  it('records a PENDING plan payment priced from the DB, not the client', async () => {
    const { service, payments } = build(null);
    const result = await service.submitInstapay({ userId: 'user-1', restaurantId: 'rest-1', planKey: 'studio' });
    expect(result).toEqual({ paymentId: 'pay-new', restaurantName: 'Cafe Nile', itemName: 'Studio', amountCents: 25000, currencyCode: 'EGP' });
    expect(payments.create).toHaveBeenCalledWith(expect.objectContaining({ planKey: 'studio', themeId: null, rawWebhookPayload: { kind: 'instapay_pending', planKey: 'studio' } }));
  });

  it('refuses free plans, unknown themes and a disabled InstaPay method', async () => {
    await expect(build(null).service.submitInstapay({ userId: 'user-1', restaurantId: 'rest-1', planKey: 'free_trial' }))
      .rejects.toThrow('Plan is not purchasable');
    await expect(build(null).service.submitInstapay({ userId: 'user-1', restaurantId: 'rest-1', themeKey: 'missing' }))
      .rejects.toThrow(NotFoundError);
    await expect(build(null, activeMethods('CARD')).service.submitInstapay({ userId: 'user-1', restaurantId: 'rest-1', planKey: 'studio' }))
      .rejects.toThrow('This payment method is currently unavailable');
  });

  it('confirming a PENDING theme payment marks it SUCCESS and applies the theme', async () => {
    const { service, payments, restaurants } = build(paymentRow({ themeId: 'theme-elegant' }));
    await service.confirmManualPayment('pay-1');
    expect(payments.updateStatus).toHaveBeenCalledWith('pay-1', 'SUCCESS', { kind: 'manual_instapay_confirmed' });
    expect(restaurants.updateTheme).toHaveBeenCalledWith('rest-1', 'theme-elegant');
  });

  it('will not confirm a payment twice', async () => {
    const { service, payments } = build(paymentRow({ status: 'SUCCESS', planKey: 'studio' }));
    await expect(service.confirmManualPayment('pay-1')).rejects.toThrow(ValidationError);
    expect(payments.updateStatus).not.toHaveBeenCalled();
  });
});
