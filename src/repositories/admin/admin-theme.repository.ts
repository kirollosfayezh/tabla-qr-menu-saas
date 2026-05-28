import type { Prisma, Theme, ThemePackage } from '@prisma/client';
import { BaseRepository } from '../base.repository';

export type AdminPackageRow = ThemePackage & { themes: Array<{ theme: Theme }> };

export class AdminThemeRepository extends BaseRepository {
  public listAll(): Promise<Theme[]> {
    return this.db.theme.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  public create(data: Prisma.ThemeCreateInput): Promise<Theme> {
    return this.db.theme.create({ data });
  }

  public update(id: string, data: Prisma.ThemeUpdateInput): Promise<Theme> {
    return this.db.theme.update({ where: { id }, data });
  }

  public delete(id: string): Promise<Theme> {
    return this.db.theme.delete({ where: { id } });
  }

  public listAllPackages(): Promise<AdminPackageRow[]> {
    return this.db.themePackage.findMany({
      include: { themes: { include: { theme: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  public createPackage(data: {
    name: string;
    nameAr: string | null;
    description: string | null;
    descriptionAr: string | null;
    priceCents: number;
    currencyCode: string;
    themeIds: string[];
  }): Promise<ThemePackage> {
    return this.db.themePackage.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        description: data.description,
        descriptionAr: data.descriptionAr,
        priceCents: data.priceCents,
        currencyCode: data.currencyCode,
        themes: {
          create: data.themeIds.map((themeId) => ({ themeId })),
        },
      },
    });
  }

  public async updatePackage(id: string, data: {
    name?: string;
    nameAr?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    priceCents?: number;
    currencyCode?: string;
    isActive?: boolean;
    themeIds?: string[];
  }): Promise<ThemePackage> {
    return this.db.$transaction(async (tx) => {
      const updated = await tx.themePackage.update({
        where: { id },
        data: {
          name: data.name,
          nameAr: data.nameAr,
          description: data.description,
          descriptionAr: data.descriptionAr,
          priceCents: data.priceCents,
          currencyCode: data.currencyCode,
          isActive: data.isActive,
        },
      });
      if (data.themeIds) {
        await tx.themePackageTheme.deleteMany({ where: { packageId: id } });
        if (data.themeIds.length > 0) {
          await tx.themePackageTheme.createMany({
            data: data.themeIds.map((themeId) => ({ packageId: id, themeId })),
          });
        }
      }
      return updated;
    });
  }

  public deletePackage(id: string): Promise<ThemePackage> {
    return this.db.themePackage.delete({ where: { id } });
  }
}
