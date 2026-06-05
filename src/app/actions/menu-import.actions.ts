'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { MenuImportService } from '@/services/menu-import.service';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { PlanRepository } from '@/repositories/plan.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { toAppError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/errors';
import { logger } from '@/lib/logger';
import type { ActionResult } from './menu.actions';

function fail(err: unknown): Extract<ActionResult, { ok: false }> {
  if (err instanceof ZodError) {
    const first = Object.values(err.flatten().fieldErrors)
      .flat()
      .find((message): message is string => typeof message === 'string') ?? 'Invalid input';
    return { ok: false, code: 'VALIDATION_ERROR', message: first };
  }
  const e = toAppError(err);
  logger.warn({ code: e.code }, 'menu import action rejected');
  return { ok: false, code: e.code, message: e.message };
}

export async function importMenuCsvAction(
  formData: FormData,
): Promise<ActionResult<{ categoriesCreated: number; itemsCreated: number }>> {
  try {
    const ctx = await requireOwnerRestaurant();
    const file = formData.get('file');
    if (!file || typeof file === 'string') {
      throw new ValidationError('Choose a CSV file to import');
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new ValidationError('Upload the filled CSV sheet downloaded from this page');
    }
    if (file.size > 1024 * 1024) {
      throw new ValidationError('CSV file is too large. Keep it under 1 MB');
    }

    const restaurant = await new RestaurantRepository().findByOwnerId(ctx.userId);
    if (!restaurant) throw new ValidationError('Restaurant missing');
    const plan = await new PlanRepository().findByKey(restaurant.planKey)
      ?? await new PlanRepository().findByKey('free_trial');
    const result = await new MenuImportService().importCsv({
      restaurantId: ctx.restaurantId,
      currencyCode: ctx.currencyCode,
      defaultLocale: ctx.defaultLocale,
      maxItems: plan?.maxItems ?? 5,
      maxCategories: plan?.maxCategories ?? 5,
      csv: await file.text(),
    });

    revalidatePath('/dashboard/menu');
    return {
      ok: true,
      value: {
        categoriesCreated: result.categoriesCreated,
        itemsCreated: result.itemsCreated,
      },
    };
  } catch (err) {
    return fail(err);
  }
}
