import { BaseRepository } from '../base.repository';
import type { Plan, Theme } from '@prisma/client';

export interface AdminPlanRow extends Plan {
  accessibleThemes: Array<{ themeId: string; theme: Pick<Theme, 'id' | 'key' | 'name' | 'nameAr'> }>;
}

export class AdminPlanRepository extends BaseRepository {
  public listAll(): Promise<AdminPlanRow[]> {
    return this.db.plan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        accessibleThemes: {
          include: { theme: { select: { id: true, key: true, name: true, nameAr: true } } },
        },
      },
    }) as Promise<AdminPlanRow[]>;
  }

  public async updateLimits(key: string, maxItems: number, maxCategories: number, monthlyPriceCents: number, yearlyPriceCents: number): Promise<Plan> {
    return this.db.plan.update({
      where: { key },
      data: { maxItems, maxCategories, monthlyPriceCents, yearlyPriceCents },
    });
  }

  public async create(data: {
    key: string;
    name: string;
    nameAr: string;
    maxItems: number;
    maxCategories: number;
    monthlyPriceCents: number;
    yearlyPriceCents: number;
  }): Promise<Plan> {
    const count = await this.db.plan.count();
    return this.db.plan.create({
      data: { ...data, sortOrder: count + 1 },
    });
  }

  /** Replace all theme access entries for a plan with the given themeIds. */
  public async setThemeAccess(planKey: string, themeIds: string[]): Promise<void> {
    await this.db.planTheme.deleteMany({ where: { planKey } });
    if (themeIds.length === 0) return;
    await this.db.planTheme.createMany({
      data: themeIds.map((themeId) => ({ planKey, themeId })),
      skipDuplicates: true,
    });
  }
}
