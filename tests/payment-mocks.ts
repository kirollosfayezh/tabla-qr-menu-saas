import { vi } from 'vitest';
import type { Payment } from '@prisma/client';

/** In-memory stand-ins for the repositories PaymentService / ManualPaymentService use. */

export function paymentRow(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 'pay-1',
    restaurantId: 'rest-1',
    userId: 'user-1',
    amountCents: 25000,
    currencyCode: 'EGP',
    status: 'PENDING',
    provider: 'PAYMOB',
    providerOrderId: '123456',
    providerTransactionId: null,
    themePackageId: null,
    themeId: null,
    planKey: null,
    rawWebhookPayload: {},
    paidAt: null,
    createdAt: new Date('2026-10-01T00:00:00Z'),
    updatedAt: new Date('2026-10-01T00:00:00Z'),
    ...overrides,
  };
}

export function paymentRepoMock(payment: Payment | null) {
  return {
    findByProviderOrderId: vi.fn(async () => payment),
    findById: vi.fn(async () => payment),
    findPlanKeyFor: vi.fn(async () => payment?.planKey ?? null),
    findThemeIdFor: vi.fn(async () => payment?.themeId ?? null),
    recordWebhookEvent: vi.fn(async () => undefined),
    updateStatus: vi.fn(async () => payment),
    create: vi.fn(async (input: Record<string, unknown>) => ({ ...paymentRow(), ...input, id: 'pay-new' })),
    setProviderOrder: vi.fn(async () => payment),
  };
}

export function restaurantRepoMock(restaurant: Record<string, unknown> | null = null) {
  return {
    findByOwnerId: vi.fn(async () => restaurant),
    findById: vi.fn(async () => restaurant),
    activatePlan: vi.fn(async () => undefined),
    updateTheme: vi.fn(async () => undefined),
  };
}

export function activeMethods(...keys: Array<'CARD' | 'APPLE_PAY' | 'INSTAPAY'>) {
  return { listActiveKeys: vi.fn(async () => keys) };
}
