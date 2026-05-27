import { logger } from '@/lib/logger';
import { ThemeNotFoundError } from '@/lib/errors/errors';
import { FALLBACK_THEME_KEY, ThemeRegistry } from './theme.registry';
import type { ITheme } from './theme.types';

/**
 * Resolve a theme by key.
 * - Strict mode throws ThemeNotFoundError if the key is missing.
 * - Default behavior logs a warning and returns the fallback theme — so a
 *   single mis-seeded DB row never takes a tenant offline.
 */
export const ThemeFactory = {
  create(key: string): ITheme {
    const direct = ThemeRegistry.get(key);
    if (direct) return direct;

    const fallback = ThemeRegistry.get(FALLBACK_THEME_KEY);
    if (!fallback) {
      throw new ThemeNotFoundError(key);
    }
    logger.warn({ requested: key, fallback: FALLBACK_THEME_KEY }, 'theme not registered; falling back');
    return fallback;
  },
  createStrict(key: string): ITheme {
    const direct = ThemeRegistry.get(key);
    if (!direct) throw new ThemeNotFoundError(key);
    return direct;
  },
};
