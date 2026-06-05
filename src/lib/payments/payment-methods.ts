import type { PaymentMethodKey } from '@prisma/client';

/** Checkout method ids used across the UI and payment actions. */
export type PaymentMethodId = 'card' | 'applePay' | 'instapay';

/** DB enum → UI id. */
export const METHOD_KEY_TO_ID: Record<PaymentMethodKey, PaymentMethodId> = {
  CARD: 'card',
  APPLE_PAY: 'applePay',
  INSTAPAY: 'instapay',
};

/** UI id → DB enum. */
export const METHOD_ID_TO_KEY: Record<PaymentMethodId, PaymentMethodKey> = {
  card: 'CARD',
  applePay: 'APPLE_PAY',
  instapay: 'INSTAPAY',
};

/** Map a list of DB keys to the UI ids the payment sheet understands. */
export function toMethodIds(keys: ReadonlyArray<PaymentMethodKey>): PaymentMethodId[] {
  return keys.map((key) => METHOD_KEY_TO_ID[key]);
}
