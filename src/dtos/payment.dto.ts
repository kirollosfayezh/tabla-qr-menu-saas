import { z } from 'zod';

export const CheckoutThemeSchema = z.object({
  themeId: z.string().uuid(),
  method: z.enum(['card', 'applePay', 'instapay']).default('card'),
});

export type CheckoutThemeDTO = z.infer<typeof CheckoutThemeSchema>;

export const CheckoutPlanSchema = z.object({
  planKey: z.string().min(1).max(40),
  method: z.enum(['card', 'applePay', 'instapay']).default('card'),
});

export type CheckoutPlanDTO = z.infer<typeof CheckoutPlanSchema>;

export const SubmitInstapaySchema = z
  .object({
    method: z.literal('instapay').default('instapay'),
    planKey: z.string().min(1).max(40).optional(),
    themeKey: z.string().min(1).max(40).optional(),
  })
  .refine((value) => Boolean(value.planKey) !== Boolean(value.themeKey), {
    message: 'Choose either a plan or a theme',
    path: ['planKey'],
  });

export type SubmitInstapayDTO = z.infer<typeof SubmitInstapaySchema>;
