'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { AuthService } from '@/services/auth.service';
import { SignUpSchema, SignInSchema } from '@/dtos/auth.dto';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { verifyTurnstile } from '@/lib/security/turnstile';
import { signIn } from '@/lib/auth/auth';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';

/** Discriminated-union return type for client-bound action responses. */
export type ActionResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

type Failure = Extract<ActionResult, { ok: false }>;

/** Convert any thrown value into an ActionResult with friendly field-level messages. */
function toFailure(err: unknown): Failure {
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

/** Sign up a new owner with email + password. */
export async function signUpAction(formData: FormData): Promise<ActionResult> {
  try {
    const ip = await clientIp();
    await enforceRateLimit('auth', `ip:${ip}`);

    const parsed = SignUpSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      turnstileToken: formData.get('turnstileToken'),
    });

    await verifyTurnstile(parsed.turnstileToken, ip, 'signup');
    await new AuthService().registerWithEmail(parsed);

    await signIn('credentials', {
      email: parsed.email,
      password: parsed.password,
      redirect: false,
    });
  } catch (err) {
    const failure: Failure = toFailure(err);
    logger.warn({ code: failure.code }, 'signUpAction rejected');
    return failure;
  }
  redirect('/onboarding');
}

/** Sign in with email + password. */
export async function signInAction(formData: FormData): Promise<ActionResult> {
  try {
    const ip = await clientIp();
    await enforceRateLimit('auth', `ip:${ip}`);

    const parsed = SignInSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      turnstileToken: formData.get('turnstileToken'),
    });

    await verifyTurnstile(parsed.turnstileToken, ip, 'login');

    const result = await signIn('credentials', {
      email: parsed.email,
      password: parsed.password,
      redirect: false,
    });

    if (!result || (result as { error?: string }).error) {
      return { ok: false, code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' };
    }
  } catch (err) {
    const failure: Failure = toFailure(err);
    logger.warn({ code: failure.code }, 'signInAction rejected');
    return failure;
  }
  redirect('/dashboard');
}

/** Begin the Google OAuth flow. */
export async function signInWithGoogleAction(): Promise<void> {
  await signIn('google', { redirectTo: '/onboarding' });
}
