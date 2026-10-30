import type { Prisma } from '@prisma/client';
import { ValidationError } from '@/lib/errors/errors';
import type { PaymobBillingData } from '@/integrations/payment/paymob.types';

/**
 * Pure parsing/shaping helpers for Paymob webhook payloads and checkout billing.
 * Kept free of any DB or service dependency so they're trivially testable.
 */

export function billingData(email: string): PaymobBillingData {
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

/**
 * Paymob's "transaction processed" callback wraps the transaction as `{ type: 'TRANSACTION', obj }`,
 * and the HMAC is computed over `obj`'s fields. Accept that envelope as well as a bare transaction.
 */
export function unwrapPaymobTransaction(body: unknown): unknown {
  return isRecord(body) && isRecord(body.obj) ? body.obj : body;
}

export function readProviderOrderId(payload: unknown): string {
  const order = isRecord(payload) ? payload.order : null;
  if (isRecord(order) && (typeof order.id === 'number' || typeof order.id === 'string')) return String(order.id);
  throw new ValidationError('Missing Paymob order id');
}

export function maybeProviderOrderId(payload: unknown): string | null {
  const order = isRecord(payload) ? payload.order : null;
  if (isRecord(order) && (typeof order.id === 'number' || typeof order.id === 'string')) return String(order.id);
  return null;
}

export function readTransactionId(payload: unknown): string | undefined {
  return isRecord(payload) && (typeof payload.id === 'number' || typeof payload.id === 'string') ? String(payload.id) : undefined;
}

export function isSuccess(payload: unknown): boolean {
  return isRecord(payload) && payload.success === true && payload.pending === false;
}

export function payloadJson(payload: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(isRecord(payload) ? payload : {})) as Prisma.InputJsonValue;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
