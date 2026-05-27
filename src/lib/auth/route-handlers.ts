import type { NextRequest } from 'next/server';
import { handlers } from './auth';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { errorResponse } from '@/lib/errors/error-handler';

/**
 * Hardened NextAuth route handlers.
 * Wraps GET/POST with the `auth` limiter (10/min/IP) before delegating.
 */

function getIp(req: NextRequest | Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') ?? '127.0.0.1';
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    await enforceRateLimit('auth', `ip:${getIp(req)}`);
    return await handlers.GET(req);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    await enforceRateLimit('auth', `ip:${getIp(req)}`);
    return await handlers.POST(req);
  } catch (err) {
    return errorResponse(err);
  }
}
