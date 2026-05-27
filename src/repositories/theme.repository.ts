import type { Theme, ThemePackage } from '@prisma/client';
import { BaseRepository } from './base.repository';

/** Data access for the Theme catalog. */
export class ThemeRepository extends BaseRepository {
  /** Themes available to owners, in display order. */
  public listActive(): Promise<Theme[]> {
    return this.db.theme.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  public findById(id: string): Promise<Theme | null> {
    return this.db.theme.findUnique({ where: { id } });
  }

  public listActivePackages(): Promise<Array<ThemePackage & { themes: Array<{ theme: Theme }> }>> {
    return this.db.themePackage.findMany({
      where: { isActive: true },
      include: { themes: { include: { theme: true } } },
      orderBy: { priceCents: 'asc' },
    });
  }
}
