import type { ITheme } from './theme.types';

/** Theme key the renderer falls back to when a tenant's chosen theme isn't registered. */
export const FALLBACK_THEME_KEY = 'classic';

/**
 * Process-singleton map of theme key → implementation.
 * Cached on globalThis so HMR + dev re-imports don't multiply instances.
 */
const KEY = Symbol.for('tabla.theme.registry');
type Registry = Map<string, ITheme>;
const globalAny = globalThis as { [k: symbol]: Registry | undefined };

function getRegistry(): Registry {
  let r = globalAny[KEY];
  if (!r) {
    r = new Map();
    globalAny[KEY] = r;
  }
  return r;
}

export const ThemeRegistry = {
  register(theme: ITheme): void {
    getRegistry().set(theme.key, theme);
  },
  has(key: string): boolean {
    return getRegistry().has(key);
  },
  get(key: string): ITheme | undefined {
    return getRegistry().get(key);
  },
  keys(): ReadonlyArray<string> {
    return Array.from(getRegistry().keys());
  },
};
