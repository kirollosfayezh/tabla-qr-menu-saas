import type { MenuCategory, MenuItem } from '@prisma/client';
import { CategoryRepository } from '@/repositories/category.repository';
import { MenuItemRepository } from '@/repositories/menu-item.repository';
import { NotFoundError, ValidationError } from '@/lib/errors/errors';
import type {
  CreateCategoryDTO,
  CreateItemDTO,
  RenameCategoryDTO,
  UpdateItemDTO,
} from '@/dtos/menu.dto';

interface Deps {
  categories?: CategoryRepository;
  items?: MenuItemRepository;
}

/**
 * Owner menu domain service.
 * Every method is tenant-scoped — restaurantId must come from the verified session
 * (see `requireOwnerRestaurant`), never from the client.
 */
export class MenuService {
  private readonly categories: CategoryRepository;
  private readonly items: MenuItemRepository;

  constructor(deps: Deps = {}) {
    this.categories = deps.categories ?? new CategoryRepository();
    this.items = deps.items ?? new MenuItemRepository();
  }

  public listCategories(restaurantId: string): Promise<MenuCategory[]> {
    return this.categories.listForRestaurant(restaurantId);
  }

  public listItems(restaurantId: string): Promise<MenuItem[]> {
    return this.items.listForRestaurant(restaurantId);
  }

  public createCategory(restaurantId: string, input: CreateCategoryDTO): Promise<MenuCategory> {
    return this.categories.create(restaurantId, {
      name: input.name,
      nameAr: input.nameAr || null,
    });
  }

  public renameCategory(restaurantId: string, input: RenameCategoryDTO): Promise<MenuCategory> {
    return this.categories.rename(input.id, restaurantId, {
      name: input.name,
      nameAr: input.nameAr || null,
    });
  }

  public async deleteCategory(restaurantId: string, id: string): Promise<void> {
    const existing = await this.categories.findById(id, restaurantId);
    if (!existing) throw new NotFoundError('Category');
    await this.categories.remove(id, restaurantId);
  }

  public reorderCategories(restaurantId: string, ids: ReadonlyArray<string>): Promise<void> {
    return this.categories.reorder(restaurantId, ids);
  }

  public async createItem(
    restaurantId: string,
    currencyCode: string,
    defaultLocale: 'en' | 'ar',
    input: CreateItemDTO,
  ): Promise<MenuItem> {
    await this.assertCategoryOwned(restaurantId, input.categoryId);
    this.assertDefaultLocaleName(defaultLocale, input.name, input.nameAr);
    return this.items.create(restaurantId, currencyCode, input);
  }

  public async updateItem(
    restaurantId: string,
    defaultLocale: 'en' | 'ar',
    input: UpdateItemDTO,
  ): Promise<MenuItem> {
    await this.assertCategoryOwned(restaurantId, input.categoryId);
    this.assertDefaultLocaleName(defaultLocale, input.name, input.nameAr);
    return this.items.update(restaurantId, input);
  }

  public toggleAvailability(
    restaurantId: string,
    id: string,
    isAvailable: boolean,
  ): Promise<void> {
    return this.items.toggleAvailability(id, restaurantId, isAvailable);
  }

  public async deleteItem(restaurantId: string, id: string): Promise<void> {
    const removed = await this.items.remove(id, restaurantId);
    if (!removed) throw new NotFoundError('Item');
  }

  public async reorderItems(
    restaurantId: string,
    categoryId: string,
    ids: ReadonlyArray<string>,
  ): Promise<void> {
    await this.assertCategoryOwned(restaurantId, categoryId);
    return this.items.reorderInCategory(restaurantId, categoryId, ids);
  }

  public async bulkUpdatePrice(
    restaurantId: string,
    categoryId: string,
    mode: 'percent' | 'absolute',
    value: number,
  ): Promise<number> {
    await this.assertCategoryOwned(restaurantId, categoryId);
    return this.items.bulkUpdatePrice(restaurantId, categoryId, mode, value);
  }

  private async assertCategoryOwned(restaurantId: string, categoryId: string): Promise<void> {
    const cat = await this.categories.findById(categoryId, restaurantId);
    if (!cat) throw new NotFoundError('Category');
  }

  /** If the restaurant's default locale is Arabic, an Arabic name is required. */
  private assertDefaultLocaleName(
    defaultLocale: 'en' | 'ar',
    name: string,
    nameAr: string | undefined,
  ): void {
    if (defaultLocale === 'ar' && (!nameAr || nameAr.trim().length === 0)) {
      throw new ValidationError('Arabic name is required for Arabic-first menus');
    }
    if (defaultLocale === 'en' && (!name || name.trim().length === 0)) {
      throw new ValidationError('English name is required');
    }
  }
}
