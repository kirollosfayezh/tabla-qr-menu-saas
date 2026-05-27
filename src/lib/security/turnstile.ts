import { env } from '@/config/env';
import { ForbiddenError, InternalServerError } from '@/lib/errors/errors';
import { logger } from '@/lib/logger';

interface TurnstileVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
  'error-codes'?: string[];
}

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Throws ForbiddenError if invalid. No-op (passes) if Turnstile is not configured
 * — Phase 1 forms call this; production must set TURNSTILE_SECRET_KEY.
 *
 * @param token - The cf-turnstile-response token from the client widget.
 * @param remoteIp - Optional client IP for replay protection.
 * @param expectedAction - Optional action label to match (e.g. "signup").
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
  expectedAction?: string,
): Promise<void> {
  if (!env.TURNSTILE_SECRET_KEY) {
    if (env.NODE_ENV === 'production') {
      throw new InternalServerError('Turnstile is not configured in production');
    }
    logger.warn('Turnstile secret missing — verification skipped (dev only)');
    return;
  }

  if (!token) throw new ForbiddenError('Bot check failed: missing token');

  const body = new URLSearchParams();
  body.set('secret', env.TURNSTILE_SECRET_KEY);
  body.set('response', token);
  if (remoteIp) body.set('remoteip', remoteIp);

  let data: TurnstileVerifyResponse;
  try {
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      cache: 'no-store',
    });
    data = (await res.json()) as TurnstileVerifyResponse;
  } catch (err) {
    logger.error({ err }, 'Turnstile verify request failed');
    throw new InternalServerError('Bot check service unreachable');
  }

  if (!data.success) {
    logger.warn({ codes: data['error-codes'] }, 'Turnstile verification rejected');
    throw new ForbiddenError('Bot check failed');
  }

  if (expectedAction && data.action && data.action !== expectedAction) {
    throw new ForbiddenError('Bot check failed: action mismatch');
  }
}
