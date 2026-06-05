'use server';

import { ZodError } from 'zod';
import { requireAdmin } from '@/lib/admin/require-admin';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { BroadcastEmailSchema } from '@/dtos/broadcast.dto';
import { BroadcastService } from '@/services/broadcast.service';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';

export type BroadcastActionResult =
  | { ok: true; total: number; sent: number; failed: number }
  | { ok: false; message: string };

/** Admin-only: send a one-off email blast to a chosen audience. Rate-limited per admin. */
export async function sendBroadcastAction(input: unknown): Promise<BroadcastActionResult> {
  try {
    const actor = await requireAdmin();
    await enforceRateLimit('auth', `broadcast:${actor.userId}`);
    const parsed = BroadcastEmailSchema.parse(input);
    const result = await new BroadcastService().send(actor, parsed);
    logger.info({ ...result, audience: parsed.audience }, 'admin broadcast completed');
    return { ok: true, ...result };
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, message: err.issues[0]?.message ?? 'Invalid input' };
    }
    const e = toAppError(err);
    logger.warn({ code: e.code }, 'broadcast action rejected');
    return { ok: false, message: e.message };
  }
}
