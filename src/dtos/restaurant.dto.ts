import { z } from 'zod';
import {
  RESERVED_SUBDOMAINS,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REGEX,
} from '@/config/constants';

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/;
// E.164-ish: leading +, 8–15 digits.
const WHATSAPP_REGEX = /^\+[1-9]\d{7,14}$/;
const CURRENCY_REGEX = /^[A-Z]{3}$/;

export const SlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(SLUG_MIN_LENGTH, `At least ${SLUG_MIN_LENGTH} characters`)
  .max(SLUG_MAX_LENGTH, `At most ${SLUG_MAX_LENGTH} characters`)
  .regex(SLUG_REGEX, 'Lowercase letters, numbers and hyphens only')
  .refine((s) => !RESERVED_SUBDOMAINS.has(s), {
    message: 'This name is reserved, choose another',
  });

/** Step 1 — restaurant basics. */
export const RestaurantBasicsSchema = z.object({
  name: z.string().trim().min(2, 'At least 2 characters').max(80),
  nameAr: z.string().trim().max(80).optional().or(z.literal('')),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  descriptionAr: z.string().trim().max(500).optional().or(z.literal('')),
  whatsappNumber: z
    .string()
    .trim()
    .regex(WHATSAPP_REGEX, 'Use international format, e.g. +201234567890'),
  currencyCode: z.string().trim().toUpperCase().regex(CURRENCY_REGEX, 'Use a 3-letter ISO code'),
  defaultLocale: z.enum(['en', 'ar']),
});

/** Step 2 — branding (colors + slug). Logo upload deferred to a later stage. */
export const RestaurantBrandingSchema = z.object({
  slug: SlugSchema,
  primaryColor: z.string().regex(HEX_COLOR, 'Use a 6-digit hex color'),
  secondaryColor: z.string().regex(HEX_COLOR, 'Use a 6-digit hex color'),
  accentColor: z.string().regex(HEX_COLOR, 'Use a 6-digit hex color'),
});

/** Step 3 — theme choice. */
export const RestaurantThemeSchema = z.object({
  themeId: z.string().uuid('Pick a theme'),
});

/** Full payload sent to createRestaurantAction at the end of the wizard. */
export const CreateRestaurantSchema = RestaurantBasicsSchema.merge(RestaurantBrandingSchema).merge(
  RestaurantThemeSchema,
);

export type RestaurantBasicsDTO = z.infer<typeof RestaurantBasicsSchema>;
export type RestaurantBrandingDTO = z.infer<typeof RestaurantBrandingSchema>;
export type RestaurantThemeDTO = z.infer<typeof RestaurantThemeSchema>;
export type CreateRestaurantDTO = z.infer<typeof CreateRestaurantSchema>;

/** Slug availability check payload. */
export const CheckSlugSchema = z.object({ slug: SlugSchema });
export type CheckSlugDTO = z.infer<typeof CheckSlugSchema>;
