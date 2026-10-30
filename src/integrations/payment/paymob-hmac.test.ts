import { describe, expect, it, vi } from 'vitest';
import { verifyPaymobHmac } from './paymob-hmac';
import { unwrapPaymobTransaction } from '@/services/paymob-payload';

/**
 * Reference vector computed independently (Python hmac/sha512) over Paymob's documented
 * field order, with the test secret from vitest.config.mts. If the key list or the
 * boolean/empty-value serialization drifts, this test fails.
 */
const EXPECTED =
  '89175cd473b81d8f443ba3d84c0b049c35a47d5b9217c3c2410ef015cf81d246afb54167745d2971af5319aac2894f39528e3e00bcfd87cc923fdc9e8f25e768';

function transaction(): Record<string, unknown> {
  return {
    id: 987654,
    amount_cents: 15000,
    created_at: '2026-10-30T12:00:00.000000',
    currency: 'EGP',
    error_occured: false,
    has_parent_transaction: false,
    integration_id: 4500001,
    is_3d_secure: true,
    is_auth: false,
    is_capture: false,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    order: { id: 123456, merchant_order_id: null },
    owner: 77,
    pending: false,
    source_data: { pan: '2346', sub_type: 'MasterCard', type: 'card' },
    success: true,
    // Fields outside the HMAC key list must not affect the signature.
    data: { message: 'Approved' },
  };
}

describe('verifyPaymobHmac', () => {
  it('accepts the signature Paymob would send for this transaction', () => {
    expect(verifyPaymobHmac(transaction(), EXPECTED)).toBe(true);
  });

  it("verifies Paymob's real callback shape once the { type, obj } envelope is unwrapped", () => {
    const body = { type: 'TRANSACTION', obj: transaction() };
    expect(verifyPaymobHmac(body, EXPECTED)).toBe(false);
    expect(verifyPaymobHmac(unwrapPaymobTransaction(body), EXPECTED)).toBe(true);
  });

  it('ignores fields that are not part of the signed key list', () => {
    const payload = { ...transaction(), data: { message: 'something else' }, extra: 1 };
    expect(verifyPaymobHmac(payload, EXPECTED)).toBe(true);
  });

  it.each([
    ['amount_cents', { amount_cents: 1 }],
    ['success flag', { success: false }],
    ['nested order id', { order: { id: 999 } }],
    ['nested source_data.pan', { source_data: { pan: '0000', sub_type: 'MasterCard', type: 'card' } }],
  ])('rejects a payload with a tampered %s', (_label, patch) => {
    expect(verifyPaymobHmac({ ...transaction(), ...patch }, EXPECTED)).toBe(false);
  });

  it('rejects a missing, empty, truncated or wrong-case signature', () => {
    expect(verifyPaymobHmac(transaction(), null)).toBe(false);
    expect(verifyPaymobHmac(transaction(), '')).toBe(false);
    expect(verifyPaymobHmac(transaction(), EXPECTED.slice(0, -2))).toBe(false);
    expect(verifyPaymobHmac(transaction(), EXPECTED.toUpperCase())).toBe(false);
  });

  it('does not throw on non-object payloads', () => {
    expect(verifyPaymobHmac(null, EXPECTED)).toBe(false);
    expect(verifyPaymobHmac('not json', EXPECTED)).toBe(false);
  });

  it('fails closed when no HMAC secret is configured', async () => {
    vi.resetModules();
    vi.doMock('@/config/env', () => ({ env: { PAYMOB_HMAC_SECRET: undefined } }));
    const { verifyPaymobHmac: verifyWithoutSecret } = await import('./paymob-hmac');
    expect(verifyWithoutSecret(transaction(), EXPECTED)).toBe(false);
    vi.doUnmock('@/config/env');
  });
});
