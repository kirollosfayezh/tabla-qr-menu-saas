import { BaseRepository } from './base.repository';
import type { MenuItem, Restaurant } from '@prisma/client';
import type { CategoryWithItems, MenuItemOptionGroupSnapshot, RestaurantSnapshot } from '@/themes/theme.types';
import { parseHeroPhotos } from '@/lib/hero-photos';
import { ThemeOverrideSchema } from '@/dtos/theme-customization.dto';
import { isTrialExpired } from '@/config/plans';

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
    const row = await this.db.restaurant.findFirst({
      where: { slug, status: 'ACTIVE', publishedAt: { not: null } },
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
    // An expired free trial takes the diner menu offline until the owner upgrades.
    if (isTrialExpired(row.planKey, row.trialEndsAt)) return null;

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
      heroPhotos: parseHeroPhotos(row.heroPhotos ?? [], row.heroImageUrls),
      heroLayout: toHeroLayout(row.heroLayout),
      heroImageScale: row.heroImageScale,
      currencyCode: row.currencyCode,
      taxPercent: Number(row.taxPercent),
      serviceChargePercent: Number(row.serviceChargePercent),
      status: row.status,
      themeKey: row.theme?.key ?? 'classic',
      themeCustomization: ThemeOverrideSchema.safeParse(row.themeCustomization).data ?? {},
      promoMessages: row.promoMessages ?? [],
    };

    const allItemIds: string[] = [];
    for (const cat of row.categories) for (const it of cat.items) allItemIds.push(it.id);
    const optionsByItem = await this.fetchOptionGroupsForItems(allItemIds);

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
        optionGroups: optionsByItem.get(it.id) ?? [],
      })),
    }));

    return { restaurant, categories };
  }

  /**
   * Bulk fetch option groups + options for many items in two raw queries.
   * Empty input or missing tables (db:push pending) returns an empty map gracefully.
   */
  private async fetchOptionGroupsForItems(itemIds: ReadonlyArray<string>): Promise<Map<string, MenuItemOptionGroupSnapshot[]>> {
    const result = new Map<string, MenuItemOptionGroupSnapshot[]>();
    if (itemIds.length === 0) return result;
    try {
      const groupRows = await this.db.$queryRawUnsafe<Array<{
        id: string;
        item_id: string;
        name: string;
        name_ar: string | null;
        min_select: number;
        max_select: number;
        required: boolean;
      }>>(
        `SELECT id, item_id, name, name_ar, min_select, max_select, required
         FROM menu_item_option_groups
         WHERE item_id = ANY($1::uuid[])
         ORDER BY sort_order ASC, created_at ASC`,
        [...itemIds],
      );
      if (groupRows.length === 0) return result;
      const groupIds = groupRows.map((g) => g.id);
      const optionRows = await this.db.$queryRawUnsafe<Array<{
        id: string;
        group_id: string;
        label: string;
        label_ar: string | null;
        price_delta_cents: number;
      }>>(
        `SELECT id, group_id, label, label_ar, price_delta_cents
         FROM menu_item_options
         WHERE group_id = ANY($1::uuid[])
         ORDER BY sort_order ASC, created_at ASC`,
        groupIds,
      );
      const optionsByGroup = new Map<string, Array<{ id: string; label: string; labelAr: string | null; priceDeltaCents: number }>>();
      for (const id of groupIds) optionsByGroup.set(id, []);
      for (const o of optionRows) {
        optionsByGroup.get(o.group_id)?.push({
          id: o.id,
          label: o.label,
          labelAr: o.label_ar,
          priceDeltaCents: o.price_delta_cents,
        });
      }
      for (const g of groupRows) {
        const list = result.get(g.item_id) ?? [];
        list.push({
          id: g.id,
          name: g.name,
          nameAr: g.name_ar,
          minSelect: g.min_select,
          maxSelect: g.max_select,
          required: g.required,
          options: optionsByGroup.get(g.id) ?? [],
        });
        result.set(g.item_id, list);
      }
    } catch {
      // Tables not migrated yet — return empty map; items render without options.
    }
    return result;
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

function toHeroLayout(value: string): RestaurantSnapshot['heroLayout'] {
  return value === 'grid' || value === 'strip' || value === 'stack' ? value : 'featured';
}
