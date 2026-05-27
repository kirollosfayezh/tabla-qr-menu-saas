'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { MenuService } from '@/services/menu.service';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';
import {
  BulkPriceUpdateSchema,
  CreateCategorySchema,
  CreateItemSchema,
  RenameCategorySchema,
  ReorderItemsSchema,
  ReorderSchema,
  ToggleAvailabilitySchema,
  UpdateItemSchema,
} from '@/dtos/menu.dto';

export type ActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

function fail(err: unknown): Extract<ActionResult, { ok: false }> {
  if (err instanceof ZodError) {
    const flat = err.flatten();
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(flat.fieldErrors)) {
      const list = msgs as string[] | undefined;
      if (list?.[0]) fieldErrors[k] = list[0];
    }
    const first = Object.values(fieldErrors)[0] ?? 'Invalid input';
    return { ok: false, code: 'VALIDATION_ERROR', message: first, fieldErrors };
  }
  const e = toAppError(err);
  logger.warn({ code: e.code }, 'menu action rejected');
  return { ok: false, code: e.code, message: e.message };
}

function bust(): void {
  revalidatePath('/dashboard/menu');
}

export async function createCategoryAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await requireOwnerRestaurant();
    const parsed = CreateCategorySchema.parse(input);
    const cat = await new MenuService().createCategory(ctx.restaurantId, parsed);
    bust();
    return { ok: true, value: { id: cat.id } };
  } catch (err) {
    return fail(err);
  }
}

export async function renameCategoryAction(input: unknown): Promise<ActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    const parsed = RenameCategorySchema.parse(input);
    await new MenuService().renameCategory(ctx.restaurantId, parsed);
    bust();
    return { ok: true, value: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    await new MenuService().deleteCategory(ctx.restaurantId, id);
    bust();
    return { ok: true, value: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function reorderCategoriesAction(input: unknown): Promise<ActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    const parsed = ReorderSchema.parse(input);
    await new MenuService().reorderCategories(ctx.restaurantId, parsed.ids);
    bust();
    return { ok: true, value: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function createItemAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const ctx = await requireOwnerRestaurant();
    const parsed = CreateItemSchema.parse(input);
    const item = await new MenuService().createItem(
      ctx.restaurantId,
      ctx.currencyCode,
      ctx.defaultLocale,
      parsed,
    );
    bust();
    return { ok: true, value: { id: item.id } };
  } catch (err) {
    return fail(err);
  }
}

export async function updateItemAction(input: unknown): Promise<ActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    const parsed = UpdateItemSchema.parse(input);
    await new MenuService().updateItem(ctx.restaurantId, ctx.defaultLocale, parsed);
    bust();
    return { ok: true, value: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function toggleAvailabilityAction(input: unknown): Promise<ActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    const parsed = ToggleAvailabilitySchema.parse(input);
    await new MenuService().toggleAvailability(ctx.restaurantId, parsed.id, parsed.isAvailable);
    bust();
    return { ok: true, value: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteItemAction(id: string): Promise<ActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    await new MenuService().deleteItem(ctx.restaurantId, id);
    bust();
    return { ok: true, value: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function reorderItemsAction(input: unknown): Promise<ActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    const parsed = ReorderItemsSchema.parse(input);
    await new MenuService().reorderItems(ctx.restaurantId, parsed.categoryId, parsed.ids);
    bust();
    return { ok: true, value: undefined };
  } catch (err) {
    return fail(err);
  }
}

export async function bulkPriceUpdateAction(
  input: unknown,
): Promise<ActionResult<{ updated: number }>> {
  try {
    const ctx = await requireOwnerRestaurant();
    const parsed = BulkPriceUpdateSchema.parse(input);
    const updated = await new MenuService().bulkUpdatePrice(
      ctx.restaurantId,
      parsed.categoryId,
      parsed.mode,
      parsed.value,
    );
    bust();
    return { ok: true, value: { updated } };
  } catch (err) {
    return fail(err);
  }
}
