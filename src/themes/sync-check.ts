import './register';
import { logger } from '@/lib/logger';
import { PublicMenuRepository } from '@/repositories/public-menu.repository';
import { ThemeRegistry } from './theme.registry';

let ranOnce = false;

/**
 * Compare active DB theme keys against the in-memory registry.
 * Logs a single warning per missing key. Idempotent — only runs once per process.
 * Safe to call on every public request; the work after the first call is a no-op.
 */
export async function checkThemeRegistrySync(): Promise<void> {
  if (ranOnce) return;
  ranOnce = true;
  try {
    const assigned = await new PublicMenuRepository().activeAssignedThemeKeys();
    const missing = assigned.filter((k) => !ThemeRegistry.has(k));
    if (missing.length === 0) return;
    for (const key of missing) {
      logger.warn(
        { themeKey: key, registered: ThemeRegistry.keys() },
        'theme assigned to active restaurants but not registered; renderer will fall back',
      );
    }
  } catch (err) {
    logger.warn({ err }, 'theme registry sync check failed');
  }
}
