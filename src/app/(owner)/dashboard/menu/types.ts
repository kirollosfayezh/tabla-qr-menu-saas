import type { MenuCategory, MenuItem } from '@prisma/client';
import type { OptionGroupDTO } from '@/dtos/menu.dto';

/** Client-safe category view (Date → ISO string already handled by Next serialization). */
export type CategoryView = MenuCategory;
export type ItemView = MenuItem;

export interface MenuPageData {
  categories: ReadonlyArray<CategoryView>;
  items: ReadonlyArray<ItemView>;
  currencyCode: string;
  defaultLocale: 'en' | 'ar';
  /** Maximum total items allowed by the restaurant's current plan. */
  maxItems: number;
  /** Maximum total categories allowed by the restaurant's current plan. */
  maxCategories: number;
}

/** Default skeleton for a fresh item being created. */
export function emptyItemDraft(categoryId: string): {
  categoryId: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  priceCents: number;
  imageUrl: string;
  isAvailable: boolean;
    tags: string[];
    allergens: string[];
    optionGroups: OptionGroupDTO[];
} {
  return {
    categoryId,
    name: '',
    nameAr: '',
    description: '',
    descriptionAr: '',
    priceCents: 0,
    imageUrl: '',
    isAvailable: true,
    tags: [],
    allergens: [],
    optionGroups: [],
  };
}

export type ItemDraft = ReturnType<typeof emptyItemDraft>;
