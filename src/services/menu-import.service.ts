import { ValidationError } from '@/lib/errors/errors';
import { MenuService } from './menu.service';
import { parseMenuImportCsv, type MenuImportRow } from '@/app/(owner)/dashboard/menu/menu-import';
import type { MenuCategory } from '@prisma/client';

export interface MenuImportInput {
  restaurantId: string;
  currencyCode: string;
  defaultLocale: 'en' | 'ar';
  maxItems: number;
  maxCategories: number;
  csv: string;
}

export interface MenuImportResult {
  categoriesCreated: number;
  categoriesReused: number;
  itemsCreated: number;
}

/** Imports the downloaded CSV template back into the owner's menu. */
export class MenuImportService {
  private readonly menu = new MenuService();

  public async importCsv(input: MenuImportInput): Promise<MenuImportResult> {
    const rows = parseMenuImportCsv(input.csv);
    const [existingCategories, existingItems] = await Promise.all([
      this.menu.listCategories(input.restaurantId),
      this.menu.listItems(input.restaurantId),
    ]);

    this.assertPlanLimits(input, rows, existingCategories, existingItems.length);

    const categories = new Map(existingCategories.map((cat) => [categoryKey(cat.name, cat.nameAr ?? ''), cat]));
    let categoriesCreated = 0;
    let categoriesReused = 0;
    let lastCategoryKey = '';

    for (const row of rows) {
      const key = categoryKey(row.categoryName, row.categoryNameAr);
      let category = categories.get(key);
      if (!category) {
        category = await this.menu.createCategory(input.restaurantId, {
          name: row.categoryName,
          nameAr: row.categoryNameAr,
        });
        categories.set(key, category);
        categoriesCreated++;
      } else if (key !== lastCategoryKey) {
        categoriesReused++;
      }
      lastCategoryKey = key;

      const item = await this.menu.createItem(
        input.restaurantId,
        input.currencyCode,
        input.defaultLocale,
        {
          categoryId: category.id,
          name: row.itemName,
          nameAr: row.itemNameAr,
          description: row.description,
          descriptionAr: row.descriptionAr,
          priceCents: row.priceCents,
          imageUrl: '',
          isAvailable: row.isAvailable,
          tags: row.tags,
          allergens: [],
        },
      );
      if (row.optionGroups.length > 0) {
        await this.menu.saveOptionGroups(input.restaurantId, {
          itemId: item.id,
          groups: row.optionGroups,
        });
      }
    }

    return { categoriesCreated, categoriesReused, itemsCreated: rows.length };
  }

  private assertPlanLimits(
    input: MenuImportInput,
    rows: ReadonlyArray<MenuImportRow>,
    existingCategories: ReadonlyArray<MenuCategory>,
    existingItemCount: number,
  ): void {
    const existingKeys = new Set(existingCategories.map((cat) => categoryKey(cat.name, cat.nameAr ?? '')));
    const importedKeys = new Set(rows.map((row) => categoryKey(row.categoryName, row.categoryNameAr)));
    let newCategoryCount = 0;
    for (const key of importedKeys) {
      if (!existingKeys.has(key)) newCategoryCount++;
    }

    if (existingCategories.length + newCategoryCount > input.maxCategories) {
      throw new ValidationError(
        `This import would exceed your plan limit of ${input.maxCategories} categories`,
      );
    }
    if (existingItemCount + rows.length > input.maxItems) {
      throw new ValidationError(`This import would exceed your plan limit of ${input.maxItems} items`);
    }
  }
}

function categoryKey(name: string, nameAr: string): string {
  return `${normalize(name)}|${normalize(nameAr)}`;
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}
