import type { CSSProperties, ReactNode } from 'react';
import type { RestaurantSnapshot } from './theme.types';

interface Props {
  restaurant: RestaurantSnapshot;
  children: ReactNode;
}

/**
 * Injects the restaurant's brand colors as CSS custom properties on a wrapper.
 * Themes consume them via `var(--d-primary)`, `var(--d-secondary)`, `var(--d-accent)`.
 * Tokens.css defines defaults; this overrides them per-tenant at render time.
 */
export function ThemeColorProvider({ restaurant, children }: Props): React.JSX.Element {
  const pageBg = `color-mix(in srgb, ${restaurant.accentColor} 10%, #ffffff)`;
  const textColor = '#111827';
  const style: CSSProperties & Record<string, string> = {
    '--d-primary': restaurant.primaryColor,
    '--d-secondary': restaurant.secondaryColor,
    '--d-accent': restaurant.accentColor,
    '--d-text': textColor,
    '--d-bg': pageBg,
    '--d-surface': '#FFFFFF',
    '--d-surface-raised': `color-mix(in srgb, ${restaurant.accentColor} 5%, #ffffff)`,
    '--d-primary-soft': `color-mix(in srgb, ${restaurant.primaryColor} 14%, #ffffff)`,
    '--d-secondary-soft': `color-mix(in srgb, ${restaurant.secondaryColor} 18%, #ffffff)`,
    '--d-accent-soft': `color-mix(in srgb, ${restaurant.accentColor} 14%, #ffffff)`,
    '--d-on-primary': readableTextOn(restaurant.primaryColor),
    '--d-on-secondary': readableTextOn(restaurant.secondaryColor),
    '--d-on-accent': readableTextOn(restaurant.accentColor),
    '--d-text-soft': '#4B5563',
    '--d-border': `color-mix(in srgb, ${restaurant.secondaryColor} 24%, #d1d5db)`,
  };
  return (
    <div data-tenant-theme={restaurant.themeKey} style={style} className="min-h-screen">
      {children}
    </div>
  );
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
