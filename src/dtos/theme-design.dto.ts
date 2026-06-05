import { z } from 'zod';

/**
 * A theme's *visual design* — stored as JSON on the Theme row so an admin can
 * create/edit a theme's look (colours, layout, fonts) without a code change.
 * One token-driven diner renderer consumes this, so admin-created themes render
 * for real and the live preview matches the diner page.
 */
const HEX = z.string().regex(/^#([0-9a-fA-F]{6})$/, 'Use a 6-digit hex colour');

export const ThemeLayoutKinds = ['list', 'cards', 'editorial'] as const;
export type ThemeLayoutKind = (typeof ThemeLayoutKinds)[number];

export const ThemeDesignSchema = z.object({
  bg: HEX,
  surface: HEX,
  primary: HEX,
  secondary: HEX,
  text: HEX,
  soft: HEX,
  border: HEX,
  display: z.string().min(1).max(80),
  body: z.string().min(1).max(80),
  radius: z.coerce.number().int().min(0).max(32),
  serif: z.boolean(),
  dark: z.boolean(),
  layout: z.enum(ThemeLayoutKinds),
});

export type ThemeDesign = z.infer<typeof ThemeDesignSchema>;

const FRAUNCES = '"Fraunces", serif';
const INTER = '"Inter", sans-serif';
const BRICOLAGE = '"Bricolage Grotesque", sans-serif';
const CORMORANT = '"Cormorant Garamond", serif';

/** Neutral default used for brand-new themes before the admin tunes them. */
export const DEFAULT_THEME_DESIGN: ThemeDesign = {
  bg: '#FFFBF5', surface: '#FFFFFF', primary: '#B8341F', secondary: '#F4E4C1',
  text: '#2A1810', soft: '#6B5440', border: '#E8DBC2',
  display: FRAUNCES, body: INTER, radius: 14, serif: true, dark: false, layout: 'list',
};

/** Built-in design presets per seeded theme key (mirrors the live-preview tokens). */
export const THEME_DESIGN_PRESETS: Record<string, ThemeDesign> = {
  classic: DEFAULT_THEME_DESIGN,
  garden: {
    bg: '#FAF6F0', surface: '#FFFFFF', primary: '#1F5F3F', secondary: '#DFEEDF',
    text: '#1A2E1F', soft: '#5E7060', border: '#E0E8D8',
    display: FRAUNCES, body: INTER, radius: 16, serif: true, dark: false, layout: 'list',
  },
  modern: {
    bg: '#FFFFFF', surface: '#F8F8F8', primary: '#1A1A1A', secondary: '#FF6B35',
    text: '#0A0A0A', soft: '#6B6B6B', border: '#ECECEC',
    display: BRICOLAGE, body: INTER, radius: 18, serif: false, dark: false, layout: 'cards',
  },
  omakase: {
    bg: '#F5F2EC', surface: '#FFFFFF', primary: '#1A1A1A', secondary: '#C8472C',
    text: '#1A1A1A', soft: '#7A7A7A', border: '#E5E0D6',
    display: CORMORANT, body: INTER, radius: 4, serif: true, dark: false, layout: 'editorial',
  },
  elegant: {
    bg: '#0F1419', surface: '#1A1F26', primary: '#C9A961', secondary: '#1F2937',
    text: '#F5E8C8', soft: '#9C8F6E', border: '#2A3038',
    display: CORMORANT, body: INTER, radius: 2, serif: true, dark: true, layout: 'cards',
  },
  market: {
    bg: '#FFFDF7', surface: '#FFFFFF', primary: '#E8590C', secondary: '#FFE3C2',
    text: '#2B2118', soft: '#7A6A55', border: '#EFE2CC',
    display: BRICOLAGE, body: INTER, radius: 16, serif: false, dark: false, layout: 'cards',
  },
  neon: {
    bg: '#0B0B12', surface: '#15151F', primary: '#00E5FF', secondary: '#FF00A8',
    text: '#F5F5FF', soft: '#9B9BB5', border: '#262636',
    display: BRICOLAGE, body: INTER, radius: 10, serif: false, dark: true, layout: 'cards',
  },
  coastal: {
    bg: '#F4FAFB', surface: '#FFFFFF', primary: '#0E7C86', secondary: '#CDE8EA',
    text: '#14333A', soft: '#5E7E84', border: '#DCEAEC',
    display: FRAUNCES, body: INTER, radius: 18, serif: true, dark: false, layout: 'list',
  },
  street: {
    bg: '#0A0A1F', surface: '#13132E', primary: '#FF2E63', secondary: '#FFD60A',
    text: '#FFFFFF', soft: '#9A9AC0', border: '#2A2A4A',
    display: BRICOLAGE, body: INTER, radius: 0, serif: false, dark: true, layout: 'cards',
  },
};

/** Parse an unknown JSON design (DB or input) into a complete, valid design. */
export function parseThemeDesign(value: unknown): ThemeDesign {
  const parsed = ThemeDesignSchema.safeParse(value);
  return parsed.success ? parsed.data : DEFAULT_THEME_DESIGN;
}
