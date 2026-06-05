import { z } from 'zod';

/**
 * Theme customization persisted on the restaurant. These values are rendered
 * directly into inline CSS on the diner page, so every field is strictly
 * validated to a safe shape — hex colors, an enumerated radius, and an
 * allowlisted font stack — never free-form CSS.
 */
const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid color');

const FONT_STACKS = [
  'var(--font-display), sans-serif',
  'var(--font-fraunces), serif',
  'var(--font-cormorant), serif',
] as const;

export const THEME_STORE_KEYS = ['classic', 'garden', 'modern', 'omakase', 'elegant', 'street'] as const;
export type ThemeStoreKey = (typeof THEME_STORE_KEYS)[number];

export const ThemeOverrideSchema = z
  .object({
    primary: Hex.optional(),
    bg: Hex.optional(),
    surface: Hex.optional(),
    text: Hex.optional(),
    soft: Hex.optional(),
    border: Hex.optional(),
    secondary: Hex.optional(),
    dark: z.boolean().optional(),
    radius: z.number().int().min(0).max(40).optional(),
    display: z.enum(FONT_STACKS).optional(),
    serif: z.boolean().optional(),
  })
  .strict();

export type ThemeOverrideDto = z.infer<typeof ThemeOverrideSchema>;

export const SelectThemeSchema = z.object({
  themeKey: z.enum(THEME_STORE_KEYS),
  override: ThemeOverrideSchema.default({}),
  method: z.enum(['card', 'applePay']).default('card'),
});

export type SelectThemeDto = z.infer<typeof SelectThemeSchema>;
