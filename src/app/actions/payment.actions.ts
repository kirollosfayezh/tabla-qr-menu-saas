'use server';

import { headers } from 'next/headers';
import { ZodError } from 'zod';
import { CheckoutPlanSchema, CheckoutThemeSchema, SubmitInstapaySchema } from '@/dtos/payment.dto';
import { auth } from '@/lib/auth/auth';
import { UnauthorizedError } from '@/lib/errors/errors';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { ManualPaymentService } from '@/services/manual-payment.service';
import { PaymentService } from '@/services/payment.service';

export type PaymentActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

export interface InstapaySubmitResult {
  paymentId: string;
  restaurantName: string;
  itemName: string;
  amountCents: number;
  currencyCode: string;
}

export interface ThemeCheckoutResult {
  redirectUrl: string | null;
  paid: boolean;
}

export async function checkoutThemeAction(
  input: unknown,
): Promise<PaymentActionResult<ThemeCheckoutResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) throw new UnauthorizedError();
    const ctx = await requireOwnerRestaurant();
    const ip = await clientIp();
    await enforceRateLimit('payment', `theme:${ctx.userId}:${ip}`);
    const parsed = CheckoutThemeSchema.parse(input);
    const result = await new PaymentService().checkoutTheme({
      userId: ctx.userId,
      restaurantId: ctx.restaurantId,
      themeId: parsed.themeId,
      email: session.user.email,
      method: parsed.method,
    });
    return { ok: true, value: result };
  } catch (err) {
    return toFailure(err);
  }
}

/**
 * Start a paid-plan upgrade (the free-trial exit door). Returns a Paymob redirect URL.
 */
export async function checkoutPlanAction(
  input: unknown,
): Promise<PaymentActionResult<ThemeCheckoutResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) throw new UnauthorizedError();
    const ctx = await requireOwnerRestaurant();
    const ip = await clientIp();
    await enforceRateLimit('payment', `plan:${ctx.userId}:${ip}`);
    const parsed = CheckoutPlanSchema.parse(input);
    const result = await new PaymentService().checkoutPlan({
      userId: ctx.userId,
      restaurantId: ctx.restaurantId,
      planKey: parsed.planKey,
      email: session.user.email,
      method: parsed.method,
    });
    return { ok: true, value: result };
  } catch (err) {
    return toFailure(err);
  }
}

export async function submitInstapayAction(
  input: unknown,
): Promise<PaymentActionResult<InstapaySubmitResult>> {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) throw new UnauthorizedError();
    const ctx = await requireOwnerRestaurant();
    const ip = await clientIp();
    await enforceRateLimit('payment', `instapay:${ctx.userId}:${ip}`);
    const parsed = SubmitInstapaySchema.parse(input);
    const result = await new ManualPaymentService().submitInstapay({
      userId: ctx.userId,
      restaurantId: ctx.restaurantId,
      planKey: parsed.planKey,
      themeKey: parsed.themeKey,
    });
    return { ok: true, value: result };
  } catch (err) {
    return toFailure(err);
  }
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

function toFailure(err: unknown): Extract<PaymentActionResult, { ok: false }> {
  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const [key, msgs] of Object.entries(err.flatten().fieldErrors)) {
      const list = msgs as string[] | undefined;
      if (list?.[0]) fieldErrors[key] = list[0];
    }
    return { ok: false, code: 'VALIDATION_ERROR', message: Object.values(fieldErrors)[0] ?? 'Invalid input', fieldErrors };
  }
  const e = toAppError(err);
  logger.warn({ code: e.code }, 'payment action rejected');
  return { ok: false, code: e.code, message: e.message };
}
