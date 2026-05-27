import { z } from 'zod';

export const CheckoutThemeSchema = z.object({
  themeId: z.string().uuid(),
  method: z.enum(['card', 'applePay']).default('card'),
});

export type CheckoutThemeDTO = z.infer<typeof CheckoutThemeSchema>;
