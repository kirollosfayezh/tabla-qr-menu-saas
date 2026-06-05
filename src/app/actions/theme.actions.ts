'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { auth } from '@/lib/auth/auth';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { UnauthorizedError } from '@/lib/errors/errors';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';
import { ThemeService } from '@/services/theme.service';
import { revalidatePublicMenu } from '@/lib/cache/public-menu-cache';
import { SelectThemeSchema } from '@/dtos/theme-customization.dto';
import type { SelectThemeOutcome } from '@/services/theme.service';
import type { ActionResult } from './menu.actions';

function fail(err: unknown): Extract<ActionResult, { ok: false }> {
  if (err instanceof ZodError) {
    const first = err.issues[0]?.message ?? 'Invalid input';
    return { ok: false, code: 'VALIDATION_ERROR', message: first };
  }
  const e = toAppError(err);
  logger.warn({ code: e.code }, 'theme action rejected');
  return { ok: false, code: e.code, message: e.message };
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

/**
 * Choose a theme for the owner's restaurant. Entitled themes (free, plan-granted
 * or already purchased) activate instantly and persist the customizer overrides;
 * paid-and-unowned themes return a checkout redirect instead of activating.
 */
export async function selectThemeAction(input: unknown): Promise<ActionResult<SelectThemeOutcome>> {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) throw new UnauthorizedError();
    const ctx = await requireOwnerRestaurant();
    await enforceRateLimit('payment', `theme:${ctx.userId}:${await clientIp()}`);
    const { themeKey, override, method } = SelectThemeSchema.parse(input);
    const outcome = await new ThemeService().selectTheme({
      userId: ctx.userId,
      restaurantId: ctx.restaurantId,
      email: session.user.email,
      themeKey,
      override,
      method,
    });
    if (outcome.activated) {
      revalidatePath('/dashboard/theme');
      revalidatePublicMenu(ctx.slug);
    }
    return { ok: true, value: outcome };
  } catch (err) {
    return fail(err);
  }
}
