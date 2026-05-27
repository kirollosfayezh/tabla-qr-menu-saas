import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '@/config/env';

const HMAC_KEYS = [
  'amount_cents', 'created_at', 'currency', 'error_occured', 'has_parent_transaction',
  'id', 'integration_id', 'is_3d_secure', 'is_auth', 'is_capture', 'is_refunded',
  'is_standalone_payment', 'is_voided', 'order.id', 'owner', 'pending',
  'source_data.pan', 'source_data.sub_type', 'source_data.type', 'success',
] as const;

export function verifyPaymobHmac(payload: unknown, expected: string | null): boolean {
  if (!env.PAYMOB_HMAC_SECRET || !expected) return false;
  const actual = createHmac('sha512', env.PAYMOB_HMAC_SECRET)
    .update(HMAC_KEYS.map((key) => readPath(payload, key)).join(''))
    .digest('hex');
  return safeEqual(actual, expected);
}

function readPath(payload: unknown, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (typeof acc !== 'object' || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, payload);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null || value === undefined) return '';
  return String(value);
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
