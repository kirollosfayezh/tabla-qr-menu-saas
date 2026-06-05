// ── Tabla theme store — customizer options + override shape ──────────────────
// The Customize panel produces a partial `ThemeOverride` that MenuView merges
// over a base theme. The same shape is what we persist to the restaurant.
import type { LayoutKind } from './store-data';

export interface ThemeOverride {
  primary?: string;
  bg?: string;
  surface?: string;
  text?: string;
  soft?: string;
  border?: string;
  secondary?: string;
  dark?: boolean;
  radius?: number;
  display?: string;
  serif?: boolean;
}

export interface AccentOption {
  name: string;
  v: string;
}

/** Curated accents — all safe with white button text. */
export const ACCENTS: ReadonlyArray<AccentOption> = [
  { name: 'Terracotta', v: '#C24E2C' },
  { name: 'Saffron', v: '#D98A1F' },
  { name: 'Olive', v: '#5B7A29' },
  { name: 'Forest', v: '#1F7A4D' },
  { name: 'Teal', v: '#0E7C7B' },
  { name: 'Royal', v: '#2A6FDB' },
  { name: 'Plum', v: '#7A3E8E' },
  { name: 'Rose', v: '#C9445F' },
  { name: 'Gold', v: '#C9A961' },
  { name: 'Ink', v: '#1A1A1A' },
];

export interface MoodOption {
  name: string;
  dark: boolean;
  bg: string;
  surface: string;
  text: string;
  soft: string;
  border: string;
  secondary: string;
}

/** Base "mood" palettes — change bg/surface/text together so contrast stays safe. */
export const MOODS: ReadonlyArray<MoodOption> = [
  { name: 'Light', dark: false, bg: '#FFFFFF', surface: '#F7F7F8', text: '#0A0A0A', soft: '#6B6B72', border: '#ECECEF', secondary: '#F0F0F2' },
  { name: 'Cream', dark: false, bg: '#FFFBF5', surface: '#FFFFFF', text: '#2A1810', soft: '#6B5440', border: '#EADFC9', secondary: '#F4E9D4' },
  { name: 'Stone', dark: false, bg: '#F4F1EB', surface: '#FFFFFF', text: '#1A1A1A', soft: '#76746E', border: '#E4DFD4', secondary: '#EAE5DA' },
  { name: 'Sage', dark: false, bg: '#F5F7F2', surface: '#FFFFFF', text: '#1A2A1F', soft: '#5E7060', border: '#DCE5D6', secondary: '#E5EDDF' },
  { name: 'Charcoal', dark: true, bg: '#16181D', surface: '#1E2127', text: '#ECECEE', soft: '#9A9AA6', border: '#2C313A', secondary: '#252A32' },
  { name: 'Midnight', dark: true, bg: '#0F1419', surface: '#1A1F26', text: '#F2EAD8', soft: '#9C8F6E', border: '#2A3038', secondary: '#232A33' },
];

export interface CornerOption {
  name: string;
  v: number;
}

export const CORNERS: ReadonlyArray<CornerOption> = [
  { name: 'Sharp', v: 2 },
  { name: 'Soft', v: 12 },
  { name: 'Round', v: 22 },
];

export interface FontOption {
  name: string;
  display: string;
  serif: boolean;
}

export const FONTS: ReadonlyArray<FontOption> = [
  { name: 'Modern', display: 'var(--font-display), sans-serif', serif: false },
  { name: 'Classic', display: 'var(--font-fraunces), serif', serif: true },
  { name: 'Editorial', display: 'var(--font-cormorant), serif', serif: true },
];

/** Readable foreground (#000 / #fff) for a hex background. */
export function pickFg(hex: string): string {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#000' : '#fff';
}

/** The merged shape MenuView consumes — base theme fields plus any overrides. */
export type EffectiveTheme = {
  key: string;
  primary: string;
  bg: string;
  surface: string;
  text: string;
  soft: string;
  border: string;
  secondary: string;
  dark: boolean;
  radius: number;
  display: string;
  body: string;
  serif: boolean;
  layout: LayoutKind;
};
