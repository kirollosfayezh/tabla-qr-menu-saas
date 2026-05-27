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
  const style: CSSProperties & Record<string, string> = {
    '--d-primary': restaurant.primaryColor,
    '--d-text': restaurant.secondaryColor,
    '--d-bg': restaurant.accentColor,
    '--d-accent': restaurant.accentColor,
    '--d-surface': '#FFFFFF',
    '--d-secondary': `color-mix(in srgb, ${restaurant.primaryColor} 14%, #ffffff)`,
    '--d-text-soft': `color-mix(in srgb, ${restaurant.secondaryColor} 70%, #ffffff)`,
    '--d-border': `color-mix(in srgb, ${restaurant.secondaryColor} 14%, ${restaurant.accentColor})`,
  };
  return (
    <div data-tenant-theme={restaurant.themeKey} style={style} className="min-h-screen">
      {children}
    </div>
  );
}
