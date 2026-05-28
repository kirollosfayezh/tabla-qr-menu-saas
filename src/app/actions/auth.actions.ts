'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { AuthService } from '@/services/auth.service';
import { PasswordResetService } from '@/services/password-reset.service';
import { SignUpSchema, SignInSchema, ForgotPasswordSchema, ResetPasswordSchema } from '@/dtos/auth.dto';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { verifyTurnstile } from '@/lib/security/turnstile';
import { signIn } from '@/lib/auth/auth';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';
import { getLocale } from 'next-intl/server';
import type { SupportedLocale } from '@/i18n/config';

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

/**
 * Request a password-reset email. Always returns ok to avoid user enumeration.
 * Rate-limited per IP via the `auth` limiter.
 */
export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const ip = await clientIp();
    await enforceRateLimit('auth', `forgot:${ip}`);
    const parsed = ForgotPasswordSchema.parse({
      email: formData.get('email'),
      turnstileToken: formData.get('turnstileToken'),
    });
    await verifyTurnstile(parsed.turnstileToken, ip, 'forgot');
    const locale = ((await getLocale()) as SupportedLocale) === 'ar' ? 'ar' : 'en';
    await new PasswordResetService().request({ email: parsed.email, locale });
    return { ok: true };
  } catch (err) {
    const failure = toFailure(err);
    logger.warn({ code: failure.code }, 'forgotPasswordAction rejected');
    return failure;
  }
}

/** Consume a reset token and rotate the user's password. */
export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const ip = await clientIp();
    await enforceRateLimit('auth', `reset:${ip}`);
    const parsed = ResetPasswordSchema.parse({
      token: formData.get('token'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });
    await new PasswordResetService().consume({ token: parsed.token, newPassword: parsed.password });
    return { ok: true, redirectTo: '/login' };
  } catch (err) {
    const failure = toFailure(err);
    logger.warn({ code: failure.code }, 'resetPasswordAction rejected');
    return failure;
  }
}
