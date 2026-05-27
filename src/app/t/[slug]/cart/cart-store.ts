'use client';

import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { CART_MAX_QTY, CART_MIN_QTY } from '@/config/constants';
import type { CartItemInput, CartState } from './types';

const stores = new Map<string, UseBoundStore<StoreApi<CartState>>>();

export function useCartStore<T>(
  restaurantId: string,
  selector: (state: CartState) => T,
): T {
  return getCartStore(restaurantId)(selector);
}

export function subtotalCents(lines: CartState['lines']): number {
  return lines.reduce((total, line) => total + line.priceCents * line.qty, 0);
}

export function lineCount(lines: CartState['lines']): number {
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
        add: (item, qty, notes) => set((state) => addLine(state, item, qty, notes)),
        setQty: (itemId, notes, qty) => set((state) => setQty(state, itemId, notes, qty)),
        setNotes: (itemId, oldNotes, notes) => set((state) => setNotes(state, itemId, oldNotes, notes)),
        setTableNumber: (tableNumber) => set({ tableNumber }),
        clear: () => set({ lines: [], tableNumber: '' }),
      }),
      {
        name: `tabla.cart.${restaurantId}`,
        storage: createJSONStorage(() => sessionStorage),
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

function addLine(state: CartState, item: CartItemInput, qty: number, notes: string): Partial<CartState> {
  const cleanNotes = notes.trim();
  const nextQty = clampQty(qty);
  const existing = state.lines.find((line) => sameLine(line.itemId, line.notes, item.id, cleanNotes));
  if (!existing) {
    return { lines: [...state.lines, { itemId: item.id, name: item.name, nameAr: item.nameAr, priceCents: item.priceCents, qty: nextQty, notes: cleanNotes, imageUrl: item.imageUrl }] };
  }
  return {
    lines: state.lines.map((line) =>
      sameLine(line.itemId, line.notes, item.id, cleanNotes)
        ? { ...line, qty: clampQty(line.qty + nextQty) }
        : line,
    ),
  };
}

function setQty(state: CartState, itemId: string, notes: string, qty: number): Partial<CartState> {
  if (qty < CART_MIN_QTY) {
    return { lines: state.lines.filter((line) => !sameLine(line.itemId, line.notes, itemId, notes)) };
  }
  return {
    lines: state.lines.map((line) =>
      sameLine(line.itemId, line.notes, itemId, notes) ? { ...line, qty: clampQty(qty) } : line,
    ),
  };
}

function setNotes(state: CartState, itemId: string, oldNotes: string, notes: string): Partial<CartState> {
  return {
    lines: state.lines.map((line) =>
      sameLine(line.itemId, line.notes, itemId, oldNotes) ? { ...line, notes: notes.trim() } : line,
    ),
  };
}

function sameLine(leftId: string, leftNotes: string, rightId: string, rightNotes: string): boolean {
  return leftId === rightId && leftNotes === rightNotes;
}

function clampQty(qty: number): number {
  return Math.min(CART_MAX_QTY, Math.max(CART_MIN_QTY, qty));
}
