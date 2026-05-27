'use client';

import type { CategoryView, ItemDraft, ItemView } from './types';
import type { MenuAction } from './use-menu-state';
import {
  bulkPriceUpdateAction,
  createCategoryAction,
  createItemAction,
  deleteCategoryAction,
  deleteItemAction,
  renameCategoryAction,
  reorderCategoriesAction,
  reorderItemsAction,
  toggleAvailabilityAction,
  updateItemAction,
} from '@/app/actions/menu.actions';

type Commit = (
  action: MenuAction,
  runServer: () => Promise<{ ok: boolean; message?: string }>,
) => Promise<{ ok: boolean; message?: string }>;

interface Deps {
  commit: Commit;
  currencyCode: string;
  itemsInActiveCategory: ReadonlyArray<ItemView>;
  categories: ReadonlyArray<CategoryView>;
  allItems: ReadonlyArray<ItemView>;
  onFail: (message: string | undefined) => void;
}

/**
 * Build a deliberately-invalid id for an optimistic row.
 * The `pending:` prefix lets the UI detect "this row isn't real yet" and
 * disable actions that would send it to the server (e.g. creating a child item
 * before the parent category has its real UUID).
 */
function tempId(): string {
  return `pending:${crypto.randomUUID()}`;
}

export function isPendingId(id: string): boolean {
  return id.startsWith('pending:');
}

function blankCategory(name: string, sortOrder: number): CategoryView {
  return {
    id: tempId(),
    restaurantId: '',
    name,
    nameAr: null,
    sortOrder,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function draftToOptimisticItem(
  draft: ItemDraft,
  currencyCode: string,
  sortOrder: number,
): ItemView {
  return {
    id: tempId(),
    restaurantId: '',
    currencyCode,
    sortOrder,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...draft,
    nameAr: draft.nameAr || null,
    description: draft.description || null,
    descriptionAr: draft.descriptionAr || null,
    imageUrl: draft.imageUrl || null,
  };
}

function mergeItem(existing: ItemView, draft: ItemDraft, id: string): ItemView {
  return {
    ...existing,
    ...draft,
    id,
    nameAr: draft.nameAr || null,
    description: draft.description || null,
    descriptionAr: draft.descriptionAr || null,
    imageUrl: draft.imageUrl || null,
  };
}

export interface MenuActionsApi {
  addCategory: (name: string) => Promise<void>;
  rename: (id: string, name: string, nameAr: string) => Promise<void>;
  reorderCats: (ids: string[]) => Promise<void>;
  deleteCat: (id: string) => Promise<void>;
  saveItem: (draft: ItemDraft, id: string | null) => Promise<boolean>;
  toggleItem: (item: ItemView, next: boolean) => Promise<void>;
  deleteItem: (item: ItemView) => Promise<void>;
  reorderItemsInCat: (categoryId: string, ids: string[]) => Promise<void>;
  applyBulk: (
    categoryId: string,
    mode: 'percent' | 'absolute',
    value: number,
  ) => Promise<void>;
}

/** All menu mutations bundled with their optimistic actions. */
export function useMenuActions(deps: Deps): MenuActionsApi {
  const { commit, onFail } = deps;
  const fail = (r: { ok: boolean; message?: string }): void => {
    if (!r.ok) onFail(r.message);
  };

  return {
    addCategory: (name) =>
      commit({ type: 'addCategory', category: blankCategory(name, deps.categories.length) }, () =>
        createCategoryAction({ name, nameAr: '' }),
      ).then(fail),
    rename: (id, name, nameAr) =>
      commit({ type: 'renameCategory', id, name, nameAr: nameAr || null }, () =>
        renameCategoryAction({ id, name, nameAr }),
      ).then(fail),
    reorderCats: (ids) =>
      commit({ type: 'reorderCategories', ids }, () => reorderCategoriesAction({ ids })).then(fail),
    deleteCat: (id) =>
      commit({ type: 'deleteCategory', id }, () => deleteCategoryAction(id)).then(fail),
    saveItem: async (draft, id) => {
      let res: { ok: boolean; message?: string };
      if (id) {
        const existing = deps.allItems.find((i) => i.id === id);
        if (!existing) return false;
        res = await commit({ type: 'updateItem', item: mergeItem(existing, draft, id) }, () =>
          updateItemAction({ ...draft, id }),
        );
      } else {
        const item = draftToOptimisticItem(
          draft,
          deps.currencyCode,
          deps.itemsInActiveCategory.length,
        );
        res = await commit({ type: 'addItem', item }, () => createItemAction(draft));
      }
      fail(res);
      return res.ok;
    },
    toggleItem: (item, next) =>
      commit({ type: 'toggleItem', id: item.id, isAvailable: next }, () =>
        toggleAvailabilityAction({ id: item.id, isAvailable: next }),
      ).then(fail),
    deleteItem: (item) =>
      commit({ type: 'deleteItem', id: item.id }, () => deleteItemAction(item.id)).then(fail),
    reorderItemsInCat: (categoryId, ids) =>
      commit({ type: 'reorderItems', categoryId, ids }, () =>
        reorderItemsAction({ categoryId, ids }),
      ).then(fail),
    applyBulk: (categoryId, mode, value) =>
      commit({ type: 'bulkPrice', categoryId, mode, value }, () =>
        bulkPriceUpdateAction({ categoryId, mode, value }),
      ).then(fail),
  };
}
