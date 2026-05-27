import './register';
import { ThemeFactory } from './theme.factory';
import { ThemeColorProvider } from './theme-color-provider';
import type { ThemeProps } from './theme.types';

/**
 * Diner-page renderer. Picks the active theme by key (with fallback), wraps it
 * in the per-tenant color provider, and returns the rendered tree.
 *
 * Import side effect: `./register` populates the registry with built-in themes.
 */
export function ThemeRenderer(props: ThemeProps): React.JSX.Element {
  const theme = ThemeFactory.create(props.restaurant.themeKey);
  return (
    <ThemeColorProvider restaurant={props.restaurant}>
      {theme.render(props)}
    </ThemeColorProvider>
  );
}
