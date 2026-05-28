'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import {
  UpdateBrandingSchema,
  UpdateSettingsSchema,
  type UpdateBrandingDTO,
  type UpdateSettingsDTO,
} from '@/dtos/restaurant.dto';
import { RestaurantService } from '@/services/restaurant.service';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';

export type RestaurantActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

export async function updateBrandingAction(
  input: UpdateBrandingDTO,
): Promise<RestaurantActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    await enforceRateLimit('auth', `branding:${ctx.userId}`);
    const parsed = UpdateBrandingSchema.parse(input);
    await new RestaurantService().updateBranding(ctx.restaurantId, parsed);
    revalidatePath('/dashboard/branding');
    return { ok: true, value: undefined };
  } catch (err) {
    return toFailure(err, 'updateBrandingAction');
  }
}

export async function updateSettingsAction(
  input: UpdateSettingsDTO,
): Promise<RestaurantActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    await enforceRateLimit('auth', `settings:${ctx.userId}`);
    const parsed = UpdateSettingsSchema.parse(input);
    await new RestaurantService().updateSettings(ctx.restaurantId, parsed);
    revalidatePath('/dashboard/settings');
    return { ok: true, value: undefined };
  } catch (err) {
    return toFailure(err, 'updateSettingsAction');
  }
}

function toFailure(err: unknown, scope: string): Extract<RestaurantActionResult, { ok: false }> {
  if (err instanceof ZodError) {
    const flat = err.flatten();
    const fieldErrors: Record<string, string> = {};
    for (const [key, msgs] of Object.entries(flat.fieldErrors)) {
      const list = msgs as string[] | undefined;
      if (list?.[0]) fieldErrors[key] = list[0];
    }
    const first = Object.values(fieldErrors)[0] ?? 'Invalid input';
    return { ok: false, code: 'VALIDATION_ERROR', message: first, fieldErrors };
  }
  const e = toAppError(err);
  logger.warn({ scope, code: e.code }, 'restaurant action rejected');
  return { ok: false, code: e.code, message: e.message };
}

