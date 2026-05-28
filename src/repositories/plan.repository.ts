import { BaseRepository } from './base.repository';
import type { Plan, PlanTheme, Theme } from '@prisma/client';

export interface PlanWithThemes extends Plan {
  accessibleThemes: Array<PlanTheme & { theme: Pick<Theme, 'id' | 'key' | 'name'> }>;
}

export interface PublicPlanPrice {
  key: string;
  monthlyPriceCents: number;
  yearlyPriceCents: number;
}

/** Read-only plan queries used by the owner dashboard. */
export class PlanRepository extends BaseRepository {
  /** Returns plan prices in sortOrder — used by marketing/pricing pages to override hardcoded i18n values. */
  public async listPublicPrices(): Promise<PublicPlanPrice[]> {
    return this.db.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { key: true, monthlyPriceCents: true, yearlyPriceCents: true },
    });
  }

  public async findByKey(key: string): Promise<PlanWithThemes | null> {
    return this.db.plan.findUnique({
      where: { key },
      include: {
        accessibleThemes: {
          include: { theme: { select: { id: true, key: true, name: true } } },
        },
      },
    }) as Promise<PlanWithThemes | null>;
  }

  /** True if the given themeId is accessible on this plan. */
  public async themeAllowed(planKey: string, themeId: string): Promise<boolean> {
    const row = await this.db.planTheme.findUnique({
      where: { planKey_themeId: { planKey, themeId } },
    });
    return row !== null;
  }
}
