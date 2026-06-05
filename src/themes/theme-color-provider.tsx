import type { CSSProperties, ReactNode } from 'react';
import { THEMES } from '@/components/store/store-data';
import type { RestaurantSnapshot } from './theme.types';

interface Props {
  restaurant: RestaurantSnapshot;
  children: ReactNode;
}

/**
 * Injects CSS custom properties for the active theme.
 * Layer order (last wins):
 *   1. Theme structural tokens (bg, surface, border, text, radius, fonts)
 *   2. Restaurant brand colors (primary, secondary, accent + computed variants)
 *   3. Owner customizer overrides (themeCustomization)
 */
export function ThemeColorProvider({ restaurant, children }: Props): React.JSX.Element {
  const token = THEMES[restaurant.themeKey as keyof typeof THEMES] ?? THEMES['classic'];

  const style: CSSProperties & Record<string, string> = {
    // ── Layer 1: theme structural tokens ──────────────────────────────────
    '--d-bg': token.bg,
    '--d-surface': token.surface,
    '--d-border': token.border,
    '--d-text': token.text,
    '--d-text-soft': token.soft,
    '--d-radius': `${token.radius}px`,
    '--d-display': token.display,
    '--d-body': token.body,
    // Bridge --d-display into Tailwind's font-serif/font-display utilities
    '--font-serif': 'var(--d-display)',
    '--font-display': 'var(--d-display)',
    // Bridge --d-radius into Tailwind's rounded-* utilities (globals.css @theme inline)
    '--radius-sm': 'calc(var(--d-radius) * 0.5)',
    '--radius-md': 'var(--d-radius)',
    '--radius-lg': 'var(--d-radius)',
    '--radius-xl': 'calc(var(--d-radius) * 1.3)',
    '--radius-2xl': 'calc(var(--d-radius) * 1.8)',
    '--radius-3xl': 'calc(var(--d-radius) * 2.4)',
    // ── Layer 2: restaurant brand colors ──────────────────────────────────
    '--d-primary': restaurant.primaryColor,
    '--d-secondary': restaurant.secondaryColor,
    '--d-accent': restaurant.accentColor,
    '--d-surface-raised': `color-mix(in srgb, ${restaurant.accentColor} 5%, ${token.surface})`,
    '--d-primary-soft': `color-mix(in srgb, ${restaurant.primaryColor} 14%, ${token.surface})`,
    '--d-secondary-soft': `color-mix(in srgb, ${restaurant.secondaryColor} 18%, ${token.surface})`,
    '--d-accent-soft': `color-mix(in srgb, ${restaurant.accentColor} 14%, ${token.surface})`,
    '--d-on-primary': readableTextOn(restaurant.primaryColor),
    '--d-on-secondary': readableTextOn(restaurant.secondaryColor),
    '--d-on-accent': readableTextOn(restaurant.accentColor),
  };

  // ── Layer 3: owner customizer overrides ───────────────────────────────
  applyCustomization(style, restaurant.themeCustomization);

  return (
    <div data-tenant-theme={restaurant.themeKey} style={style} className="@container min-h-screen">
      {children}
    </div>
  );
}

function applyCustomization(style: Record<string, string>, o: RestaurantSnapshot['themeCustomization']): void {
  if (!o) return;
  if (o.primary) {
    style['--d-primary'] = o.primary;
    style['--d-primary-soft'] = `color-mix(in srgb, ${o.primary} 14%, #ffffff)`;
    style['--d-on-primary'] = readableTextOn(o.primary);
  }
  if (o.secondary) {
    style['--d-secondary'] = o.secondary;
    style['--d-secondary-soft'] = `color-mix(in srgb, ${o.secondary} 18%, #ffffff)`;
    style['--d-on-secondary'] = readableTextOn(o.secondary);
  }
  if (o.bg) style['--d-bg'] = o.bg;
  if (o.surface) {
    style['--d-surface'] = o.surface;
    style['--d-surface-raised'] = o.surface;
  }
  if (o.text) style['--d-text'] = o.text;
  if (o.soft) style['--d-text-soft'] = o.soft;
  if (o.border) style['--d-border'] = o.border;
  if (o.display) style['--d-display'] = o.display;
  if (o.radius != null) style['--d-radius'] = `${o.radius}px`;
}

function readableTextOn(hex: string): string {
  return relativeLuminance(hex) > 0.45 ? '#111827' : '#FFFFFF';
}

function relativeLuminance(hex: string): number {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!match) return 1;
  const raw = match[1]!;
  const [r, g, b] = [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4, 6)].map((part) => {
    const channel = parseInt(part, 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}
