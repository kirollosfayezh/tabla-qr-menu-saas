import { z } from 'zod';

export const AnalyticsEventSchema = z.object({
  restaurantId: z.string().uuid(),
  eventType: z.enum(['PAGE_VIEW', 'ITEM_VIEW', 'ORDER_INITIATED', 'WHATSAPP_REDIRECT']),
  sessionId: z.string().min(1).max(128).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});
export type AnalyticsEventDTO = z.infer<typeof AnalyticsEventSchema>;
