import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AnalyticsEventSchema } from '@/dtos/analytics.dto';
import { AnalyticsService } from '@/services/analytics.service';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { errorResponse } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = await clientIp();
    await enforceRateLimit('public', `analytics:${ip}`);
    const body = await safeParseBody(req);
    const parsed = AnalyticsEventSchema.parse(body);
    await new AnalyticsService().record(parsed);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof ZodError) {
      // Beacons must never disrupt the diner experience — log + swallow.
      logger.debug({ err }, 'analytics event rejected');
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    return errorResponse(err);
  }
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

async function safeParseBody(req: NextRequest): Promise<unknown> {
  // navigator.sendBeacon sends a Blob with `application/json` content-type — req.json() handles it.
  try {
    return await req.json();
  } catch {
    return {};
  }
}
