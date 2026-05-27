import { z } from 'zod';

export const CartLineSchema = z.object({
  itemId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
  notes: z.string().trim().max(200).optional().or(z.literal('')),
});

export const PlaceOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  lines: z.array(CartLineSchema).min(1).max(50),
  tableNumber: z.string().trim().max(20).optional().or(z.literal('')),
  locale: z.enum(['en', 'ar']),
  deviceInfo: z.string().trim().max(500).optional().or(z.literal('')),
});

export type CartLineDTO = z.infer<typeof CartLineSchema>;
export type PlaceOrderDTO = z.infer<typeof PlaceOrderSchema>;
