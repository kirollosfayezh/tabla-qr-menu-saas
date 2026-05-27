import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { env } from '@/config/env';
import { RateLimitError } from '../errors/errors';

/** Singleton Redis client backed by Upstash REST API (Edge-compatible). */
const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Pre-built rate limiters keyed by purpose.
 * Tuned values: tighten as we observe traffic.
 */
export const limiters = {
  /** Public unauthenticated traffic: 60 req / minute per IP. */
  public: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'rl:public',
  }),
  /** Auth endpoints (login/signup): 10 / minute per IP, brute-force guard. */
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    analytics: true,
    prefix: 'rl:auth',
  }),
  /** Payment checkout creation: 5 / minute per user. */
  payment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'rl:payment',
  }),
  /** Webhook endpoint: 120 / minute per IP (Paymob may retry). */
  webhook: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, '1 m'),
    analytics: true,
    prefix: 'rl:webhook',
  }),
  /** Diner order submissions: 30 / minute per IP per tenant. */
  order: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'),
    analytics: true,
    prefix: 'rl:order',
  }),
} as const;

export type LimiterKey = keyof typeof limiters;

/**
 * Apply a named limiter to the given identifier.
 * Throws RateLimitError on block; returns headers describing the limit on success.
 */
export async function enforceRateLimit(
  limiterKey: LimiterKey,
  identifier: string,
): Promise<{ headers: Record<string, string> }> {
  const result = await limiters[limiterKey].limit(identifier);
  const headers = {
    'x-ratelimit-limit': String(result.limit),
    'x-ratelimit-remaining': String(result.remaining),
    'x-ratelimit-reset': String(result.reset),
  };
  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    throw new RateLimitError(retryAfter);
  }
  return { headers };
}
