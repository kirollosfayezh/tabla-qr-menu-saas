'use server';

import { headers } from 'next/headers';
import { ZodError } from 'zod';
import { auth } from '@/lib/auth/auth';
import {
  CheckSlugSchema,
  CreateRestaurantSchema,
  type CreateRestaurantDTO,
} from '@/dtos/restaurant.dto';
import { RestaurantService, type SlugCheck } from '@/services/restaurant.service';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { UnauthorizedError } from '@/lib/errors/errors';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';

export type OnboardingActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

function toFailure(err: unknown): Extract<OnboardingActionResult, { ok: false }> {
  if (err instanceof ZodError) {
    const flat = err.flatten();
    const fieldErrors: Record<string, string> = {};
    for (const [k, msgs] of Object.entries(flat.fieldErrors)) {
      const list = msgs as string[] | undefined;
      if (list && list.length > 0) fieldErrors[k] = list[0]!;
    }
    const first = Object.values(fieldErrors)[0] ?? 'Invalid input';
    return { ok: false, code: 'VALIDATION_ERROR', message: first, fieldErrors };
  }
  const e = toAppError(err);
  return { ok: false, code: e.code, message: e.message };
}

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user.id;
}

/** Live slug availability check. Rate-limited so users can't brute-force the namespace. */
export async function checkSlugAction(slug: string): Promise<OnboardingActionResult<SlugCheck>> {
  try {
    await requireUserId();
    const ip = await clientIp();
    await enforceRateLimit('public', `slug-check:${ip}`);
    const parsed = CheckSlugSchema.parse({ slug });
    const result = await new RestaurantService().checkSlug(parsed.slug);
    return { ok: true, value: result };
  } catch (err) {
    return toFailure(err);
  }
}

/** Create the owner's restaurant at the end of the wizard. */
export async function createRestaurantAction(
  input: CreateRestaurantDTO,
): Promise<OnboardingActionResult<{ slug: string }>> {
  try {
    const userId = await requireUserId();
    const ip = await clientIp();
    await enforceRateLimit('auth', `onboard:${ip}`);
    const parsed = CreateRestaurantSchema.parse(input);
    const created = await new RestaurantService().createForUser(userId, parsed);
    logger.info({ restaurantId: created.id, slug: created.slug }, 'restaurant created');
    return { ok: true, value: { slug: created.slug } };
  } catch (err) {
    const failure = toFailure(err);
    logger.warn({ code: failure.code }, 'createRestaurantAction rejected');
    return failure;
  }
}
