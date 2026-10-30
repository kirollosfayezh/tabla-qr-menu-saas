import { describe, expect, it } from 'vitest';
import { ValidationError } from '@/lib/errors/errors';
import {
  billingData,
  isSuccess,
  maybeProviderOrderId,
  payloadJson,
  readProviderOrderId,
  readTransactionId,
} from './paymob-payload';

describe('paymob payload helpers', () => {
  it('reads the provider order id as a string from numeric or string ids', () => {
    expect(readProviderOrderId({ order: { id: 123 } })).toBe('123');
    expect(readProviderOrderId({ order: { id: 'abc' } })).toBe('abc');
  });

  it('throws a ValidationError when the order id is missing', () => {
    expect(() => readProviderOrderId({})).toThrow(ValidationError);
    expect(() => readProviderOrderId({ order: { id: { nested: true } } })).toThrow(ValidationError);
    expect(maybeProviderOrderId(null)).toBeNull();
    expect(maybeProviderOrderId({ order: { id: 5 } })).toBe('5');
  });

  it('reads the transaction id when present', () => {
    expect(readTransactionId({ id: 42 })).toBe('42');
    expect(readTransactionId({})).toBeUndefined();
  });

  it('treats only success=true AND pending=false as a successful payment', () => {
    expect(isSuccess({ success: true, pending: false })).toBe(true);
    expect(isSuccess({ success: true, pending: true })).toBe(false);
    expect(isSuccess({ success: 'true', pending: false })).toBe(false);
    expect(isSuccess({ success: true })).toBe(false);
    expect(isSuccess(null)).toBe(false);
  });

  it('produces a JSON-safe copy of the payload for storage', () => {
    const json = payloadJson({ a: 1, when: new Date('2026-01-01T00:00:00Z'), skip: undefined });
    expect(json).toEqual({ a: 1, when: '2026-01-01T00:00:00.000Z' });
    expect(payloadJson('string')).toEqual({});
  });

  it('fills Paymob billing data around the owner email', () => {
    expect(billingData('owner@example.com')).toMatchObject({ email: 'owner@example.com', country: 'EG' });
  });
});
