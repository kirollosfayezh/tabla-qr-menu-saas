import { BaseRepository } from './base.repository';
import type { MenuItem, Restaurant } from '@prisma/client';
import type { CategoryWithItems, RestaurantSnapshot } from '@/themes/theme.types';

interface FullMenu {
  restaurant: RestaurantSnapshot;
  categories: ReadonlyArray<CategoryWithItems>;
}

/**
 * Diner-side, read-only access to a published menu.
 * Pulls restaurant + theme + categories + items in one round-trip and projects
 * to safe DTOs so themes can't reach into Prisma fields by accident.
 */
export class PublicMenuRepository extends BaseRepository {
  public async findBySlug(slug: string): Promise<FullMenu | null> {
    const row = await this.db.restaurant.findUnique({
      where: { slug },
      include: {
        theme: { select: { key: true } },
        categories: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          include: {
            items: {
              orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            },
          },
        },
      },
    });
    if (!row) return null;

    const restaurant: RestaurantSnapshot = {
      id: row.id,
      slug: row.slug,
      name: row.name,
      nameAr: row.nameAr,
      description: row.description,
      descriptionAr: row.descriptionAr,
      logoUrl: row.logoUrl,
      whatsappNumber: row.whatsappNumber,
      defaultLocale: row.defaultLocale,
      primaryColor: row.primaryColor,
      secondaryColor: row.secondaryColor,
      accentColor: row.accentColor,
      currencyCode: row.currencyCode,
      taxPercent: Number(row.taxPercent),
      serviceChargePercent: Number(row.serviceChargePercent),
      status: row.status,
      themeKey: row.theme?.key ?? 'classic',
    };

    const categories: CategoryWithItems[] = row.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameAr: cat.nameAr,
      items: cat.items.map((it) => ({
        id: it.id,
        categoryId: it.categoryId,
        name: it.name,
        nameAr: it.nameAr,
        description: it.description,
        descriptionAr: it.descriptionAr,
        priceCents: it.priceCents,
        imageUrl: it.imageUrl,
        isAvailable: it.isAvailable,
        tags: it.tags,
        allergens: it.allergens,
      })),
    }));

    return { restaurant, categories };
  }

  /** Active theme keys assigned to at least one ACTIVE restaurant. Used by the boot-time sync check. */
  public async activeAssignedThemeKeys(): Promise<ReadonlyArray<string>> {
    const rows = await this.db.restaurant.findMany({
      where: { status: 'ACTIVE', themeId: { not: null } },
      select: { theme: { select: { key: true } } },
      distinct: ['themeId'],
    });
    return rows.map((r) => r.theme?.key).filter((k): k is string => Boolean(k));
  }

  public findRestaurantBySlug(slug: string): Promise<Restaurant | null> {
    return this.db.restaurant.findUnique({ where: { slug } });
  }

  public listItemsByIds(
    restaurantId: string,
    itemIds: ReadonlyArray<string>,
  ): Promise<MenuItem[]> {
    return this.db.menuItem.findMany({
      where: { restaurantId, id: { in: [...itemIds] } },
    });
  }
}
