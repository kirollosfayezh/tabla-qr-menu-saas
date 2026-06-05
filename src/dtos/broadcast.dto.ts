import { z } from 'zod';

/** Admin broadcast email input. Audience maps to a user-role filter in the service. */
export const BroadcastEmailSchema = z.object({
  audience: z.enum(['all', 'owners', 'admins']).default('all'),
  subject: z.string().trim().min(3).max(150),
  body: z.string().trim().min(10).max(5000),
});

export type BroadcastEmailDTO = z.infer<typeof BroadcastEmailSchema>;
export type BroadcastAudience = BroadcastEmailDTO['audience'];
