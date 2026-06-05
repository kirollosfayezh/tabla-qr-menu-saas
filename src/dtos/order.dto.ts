import { z } from 'zod';

export const CartLineSchema = z.object({
  itemId: z.string().uuid(),
  qty: z.number().int().min(1).max(99),
  notes: z.string().trim().max(200).optional().or(z.literal('')),
  optionIds: z.array(z.string().uuid()).max(100).default([]),
});

export const PlaceOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  lines: z.array(CartLineSchema).min(1).max(50),
  fulfillmentType: z.enum(['DINE_IN', 'DELIVERY']).default('DINE_IN'),
  tableNumber: z.string().trim().max(20).optional().or(z.literal('')),
  customerName: z.string().trim().max(80).optional().or(z.literal('')),
  customerPhone: z.string().trim().max(30).optional().or(z.literal('')),
  deliveryAddress: z.string().trim().max(240).optional().or(z.literal('')),
  deliveryLat: z.number().gte(-90).lte(90).optional(),
  deliveryLng: z.number().gte(-180).lte(180).optional(),
  locale: z.enum(['en', 'ar']),
  deviceInfo: z.string().trim().max(500).optional().or(z.literal('')),
}).superRefine((value, ctx) => {
  if (value.fulfillmentType !== 'DELIVERY') return;
  if (!value.customerPhone?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['customerPhone'], message: 'Phone is required for delivery' });
  }
  if (!value.deliveryAddress?.trim()) {
    ctx.addIssue({ code: 'custom', path: ['deliveryAddress'], message: 'Address is required for delivery' });
  }
});

export type CartLineDTO = z.infer<typeof CartLineSchema>;
export type PlaceOrderDTO = z.infer<typeof PlaceOrderSchema>;
