'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { requireAdmin } from '@/lib/admin/require-admin';
import { SupportRepository } from '@/repositories/support.repository';
import { enforceRateLimit } from '@/lib/security/rate-limiter';

const MessageSchema = z.object({
  content: z.string().trim().min(1).max(2000),
});

export type SupportActionResult = { ok: true } | { ok: false; message: string };

/** Owner sends a message to admin. */
export async function ownerSendMessageAction(input: unknown): Promise<SupportActionResult> {
  try {
    const ctx = await requireOwnerRestaurant();
    await enforceRateLimit('public', `support:${ctx.userId}`);
    const { content } = MessageSchema.parse(input);
    await new SupportRepository().send(ctx.restaurantId, content, 'OWNER');
    revalidatePath('/dashboard/recommendations');
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Failed' };
  }
}

/** Admin replies to a restaurant's conversation. */
export async function adminReplyAction(restaurantId: string, input: unknown): Promise<SupportActionResult> {
  try {
    await requireAdmin();
    const { content } = MessageSchema.parse(input);
    await new SupportRepository().send(restaurantId, content, 'ADMIN');
    await new SupportRepository().markReadByAdmin(restaurantId);
    revalidatePath('/admin/support');
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Failed' };
  }
}
