'use client';

import { subtotalCents } from './cart-store';
import type { CartLine } from './types';

export interface CartTotals {
  subtotalCents: number;
  taxCents: number;
  serviceCents: number;
  totalCents: number;
}

export function useCartTotals(
  lines: ReadonlyArray<CartLine>,
  taxPercent: number,
  servicePercent: number,
): CartTotals {
  const subtotal = subtotalCents([...lines]);
  const tax = Math.round((subtotal * taxPercent) / 100);
  const service = Math.round((subtotal * servicePercent) / 100);
  return {
    subtotalCents: subtotal,
    taxCents: tax,
    serviceCents: service,
    totalCents: subtotal + tax + service,
  };
}
