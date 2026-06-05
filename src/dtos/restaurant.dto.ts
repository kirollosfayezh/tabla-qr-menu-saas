import { z } from 'zod';
import {
  RESERVED_SUBDOMAINS,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REGEX,
} from '@/config/constants';
import { ThemeOverrideSchema } from './theme-customization.dto';

const HEX_COLOR = /^#([0-9a-fA-F]{6})$/;
// E.164-ish: leading +, 8–15 digits.
const WHATSAPP_REGEX = /^\+[1-9]\d{7,14}$/;
const CURRENCY_REGEX = /^[A-Z]{3}$/;
const HERO_LAYOUTS = ['featured', 'grid', 'strip', 'stack'] as const;

/** A hero photo with persisted studio transforms (rotation + flip). */
export const HeroPhotoSchema = z.object({
  url: z.string().url(),
  rotation: z.union([z.literal(0), z.literal(90), z.literal(180), z.literal(270)]).default(0),
  flipX: z.boolean().default(false),
  flipY: z.boolean().default(false),
});
export type HeroPhotoDTO = z.infer<typeof HeroPhotoSchema>;
const HeroPhotosArraySchema = z.array(HeroPhotoSchema).max(6).default([]);

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
  heroPhotos: HeroPhotosArraySchema,
  heroLayout: z.enum(HERO_LAYOUTS).default('featured'),
  heroImageScale: z.coerce.number().int().min(70).max(140).default(100),
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

/** Owner-side update of branding (logo, name, tagline, colors). */
export const UpdateBrandingSchema = z.object({
  name: z.string().trim().min(2, 'At least 2 characters').max(80),
  nameAr: z.string().trim().max(80).optional().or(z.literal('')).transform((v) => v ?? ''),
  description: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v ?? ''),
  descriptionAr: z.string().trim().max(500).optional().or(z.literal('')).transform((v) => v ?? ''),
  logoUrl: z.string().url().optional().or(z.literal('')).transform((v) => v ?? ''),
  primaryColor: z.string().regex(HEX_COLOR, 'Use a 6-digit hex color'),
  secondaryColor: z.string().regex(HEX_COLOR, 'Use a 6-digit hex color'),
  accentColor: z.string().regex(HEX_COLOR, 'Use a 6-digit hex color'),
  heroPhotos: HeroPhotosArraySchema,
  heroLayout: z.enum(HERO_LAYOUTS).default('featured'),
  heroImageScale: z.coerce.number().int().min(70).max(140).default(100),
  themeCustomization: ThemeOverrideSchema.default({}),
  promoMessages: z.string().trim().max(120).array().max(10).default([]),
});
export type UpdateBrandingDTO = z.infer<typeof UpdateBrandingSchema>;

/** Owner-side general settings update. */
export const UpdateSettingsSchema = z.object({
  whatsappNumber: z.string().trim().regex(WHATSAPP_REGEX, 'Use international format, e.g. +201234567890'),
  currencyCode: z.string().trim().toUpperCase().regex(CURRENCY_REGEX, 'Use a 3-letter ISO code'),
  defaultLocale: z.enum(['en', 'ar']),
  taxPercent: z.coerce.number().min(0, 'Must be ≥ 0').max(100, 'Must be ≤ 100'),
  serviceChargePercent: z.coerce.number().min(0, 'Must be ≥ 0').max(100, 'Must be ≤ 100'),
});
export type UpdateSettingsDTO = z.infer<typeof UpdateSettingsSchema>;
