'use client';

import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CART_MAX_QTY, CART_MIN_QTY } from '@/config/constants';
import { lineKey, type CartItemInput, type CartLine, type CartSelection, type CartState } from './types';

const stores = new Map<string, UseBoundStore<StoreApi<CartState>>>();

export function useCartStore<T>(
  restaurantId: string,
  selector: (state: CartState) => T,
): T {
  return getCartStore(restaurantId)(selector);
}

/** Effective unit price for a cart line, including selected option deltas. */
export function unitPriceCents(line: CartLine): number {
  return line.priceCents + (line.selections ?? []).reduce((sum, s) => sum + s.priceDeltaCents, 0);
}

export function subtotalCents(lines: ReadonlyArray<CartLine>): number {
  return lines.reduce((total, line) => total + unitPriceCents(line) * line.qty, 0);
}

export function lineCount(lines: ReadonlyArray<CartLine>): number {
  return lines.reduce((total, line) => total + line.qty, 0);
}

function getCartStore(restaurantId: string): UseBoundStore<StoreApi<CartState>> {
  const existing = stores.get(restaurantId);
  if (existing) return existing;
  const store = create<CartState>()(
    persist(
      (set) => ({
        restaurantId,
        lines: [],
        tableNumber: '',
        add: (item, qty, notes, selections) =>
          set((state) => addLine(state, item, qty, notes, selections)),
        setQty: (key, qty) => set((state) => setQtyState(state, key, qty)),
        setNotes: (key, notes) => set((state) => setNotesState(state, key, notes)),
        setTableNumber: (tableNumber) => set({ tableNumber }),
        clear: () => set({ lines: [], tableNumber: '' }),
      }),
      {
        name: `tabla.cart.${restaurantId}`,
        storage: createJSONStorage(() => sessionStorage),
        version: 1,
        migrate: (persisted) => migrateCartState(persisted, restaurantId),
        partialize: (state) => ({
          restaurantId: state.restaurantId,
          lines: state.lines,
          tableNumber: state.tableNumber,
        }),
      },
    ),
  );
  stores.set(restaurantId, store);
  return store;
}

function migrateCartState(persisted: unknown, restaurantId: string): Partial<CartState> {
  if (!persisted || typeof persisted !== 'object') return { restaurantId, lines: [], tableNumber: '' };
  const state = persisted as Partial<CartState>;
  return {
    restaurantId,
    tableNumber: typeof state.tableNumber === 'string' ? state.tableNumber : '',
    lines: Array.isArray(state.lines)
      ? state.lines.map((line) => ({ ...line, selections: line.selections ?? [] }))
      : [],
  };
}

function addLine(
  state: CartState,
  item: CartItemInput,
  qty: number,
  notes: string,
  selections: ReadonlyArray<CartSelection>,
): Partial<CartState> {
  const cleanNotes = notes.trim();
  const nextQty = clampQty(qty);
  const candidate: CartLine = {
    itemId: item.id,
    name: item.name,
    nameAr: item.nameAr,
    priceCents: item.priceCents,
    qty: nextQty,
    notes: cleanNotes,
    imageUrl: item.imageUrl,
    selections: [...selections],
  };
  const key = lineKey(candidate);
  const existing = state.lines.find((line) => lineKey(line) === key);
  if (!existing) return { lines: [...state.lines, candidate] };
  return {
    lines: state.lines.map((line) =>
      lineKey(line) === key ? { ...line, qty: clampQty(line.qty + nextQty) } : line,
    ),
  };
}

function setQtyState(state: CartState, key: string, qty: number): Partial<CartState> {
  if (qty < CART_MIN_QTY) {
    return { lines: state.lines.filter((line) => lineKey(line) !== key) };
  }
  return {
    lines: state.lines.map((line) =>
      lineKey(line) === key ? { ...line, qty: clampQty(qty) } : line,
    ),
  };
}

function setNotesState(state: CartState, key: string, notes: string): Partial<CartState> {
  return {
    lines: state.lines.map((line) =>
      lineKey(line) === key ? { ...line, notes: notes.trim() } : line,
    ),
  };
}

function clampQty(qty: number): number {
  return Math.min(CART_MAX_QTY, Math.max(CART_MIN_QTY, qty));
}
