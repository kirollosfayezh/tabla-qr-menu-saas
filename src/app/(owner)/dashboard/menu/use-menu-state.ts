'use client';

import { useOptimistic, useTransition } from 'react';
import type { CategoryView, ItemView } from './types';

interface MenuState {
  categories: ReadonlyArray<CategoryView>;
  items: ReadonlyArray<ItemView>;
}

export type MenuAction =
  | { type: 'addCategory'; category: CategoryView }
  | { type: 'renameCategory'; id: string; name: string; nameAr: string | null }
  | { type: 'deleteCategory'; id: string }
  | { type: 'reorderCategories'; ids: ReadonlyArray<string> }
  | { type: 'addItem'; item: ItemView }
  | { type: 'updateItem'; item: ItemView }
  | { type: 'deleteItem'; id: string }
  | { type: 'toggleItem'; id: string; isAvailable: boolean }
  | { type: 'reorderItems'; categoryId: string; ids: ReadonlyArray<string> }
  | { type: 'bulkPrice'; categoryId: string; mode: 'percent' | 'absolute'; value: number };

function applyAction(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case 'addCategory':
      return { ...state, categories: [...state.categories, action.category] };
    case 'renameCategory':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, name: action.name, nameAr: action.nameAr } : c,
        ),
      };
    case 'deleteCategory':
      return {
        categories: state.categories.filter((c) => c.id !== action.id),
        items: state.items.filter((i) => i.categoryId !== action.id),
      };
    case 'reorderCategories':
      return { ...state, categories: reorder(state.categories, action.ids) };
    case 'addItem':
      return { ...state, items: [...state.items, action.item] };
    case 'updateItem':
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.item.id ? action.item : i)),
      };
    case 'deleteItem':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'toggleItem':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, isAvailable: action.isAvailable } : i,
        ),
      };
    case 'reorderItems': {
      const inCat = reorder(
        state.items.filter((i) => i.categoryId === action.categoryId),
        action.ids,
      );
      const others = state.items.filter((i) => i.categoryId !== action.categoryId);
      return { ...state, items: [...others, ...inCat] };
    }
    case 'bulkPrice':
      return {
        ...state,
        items: state.items.map((i) =>
          i.categoryId === action.categoryId
            ? { ...i, priceCents: applyPrice(i.priceCents, action.mode, action.value) }
            : i,
        ),
      };
  }
}

function reorder<T extends { id: string }>(list: ReadonlyArray<T>, ids: ReadonlyArray<string>): T[] {
  const map = new Map(list.map((x) => [x.id, x]));
  return ids.map((id) => map.get(id)).filter((x): x is T => Boolean(x));
}

function applyPrice(current: number, mode: 'percent' | 'absolute', value: number): number {
  return mode === 'absolute'
    ? Math.max(0, Math.round(value))
    : Math.max(0, Math.round(current * (1 + value / 100)));
}

/**
 * Optimistic menu state.
 * `base` comes from server props; React 19's `useOptimistic` layers in-flight
 * actions on top during a transition and falls back to `base` once the server
 * action's `revalidatePath()` flows fresh data back through props.
 */
export function useMenuState(base: MenuState): {
  state: MenuState;
  commit: (
    action: MenuAction,
    runServer: () => Promise<{ ok: boolean; message?: string }>,
  ) => Promise<{ ok: boolean; message?: string }>;
  pending: boolean;
} {
  const [optimistic, addOptimistic] = useOptimistic(base, applyAction);
  const [pending, startTransition] = useTransition();

  function commit(
    action: MenuAction,
    runServer: () => Promise<{ ok: boolean; message?: string }>,
  ): Promise<{ ok: boolean; message?: string }> {
    return new Promise((resolve) => {
      startTransition(async () => {
        addOptimistic(action);
        const res = await runServer();
        resolve(res);
      });
    });
  }

  return { state: optimistic, commit, pending };
}
