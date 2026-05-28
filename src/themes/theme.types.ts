import type { ReactNode } from 'react';

/** A hero photo with persisted transforms applied by the studio editor. */
export interface HeroPhoto {
  url: string;
  rotation: 0 | 90 | 180 | 270;
  flipX: boolean;
  flipY: boolean;
}

/** Restaurant data the diner page actually needs. Pruned from the Prisma model so themes can't accidentally read sensitive fields. */
export interface RestaurantSnapshot {
  id: string;
  slug: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  logoUrl: string | null;
  whatsappNumber: string;
  defaultLocale: 'en' | 'ar';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  heroPhotos: ReadonlyArray<HeroPhoto>;
  heroLayout: 'featured' | 'grid' | 'strip' | 'stack';
  heroImageScale: number;
  currencyCode: string;
  taxPercent: number;
  serviceChargePercent: number;
  status: 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED';
  /** Active theme key (resolved from Restaurant.theme.key). */
  themeKey: string;
}

export interface MenuItemOptionSnapshot {
  id: string;
  label: string;
  labelAr: string | null;
  priceDeltaCents: number;
}

export interface MenuItemOptionGroupSnapshot {
  id: string;
  name: string;
  nameAr: string | null;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  options: ReadonlyArray<MenuItemOptionSnapshot>;
}

export interface MenuItemSnapshot {
  id: string;
  categoryId: string;
  name: string;
  nameAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  priceCents: number;
  imageUrl: string | null;
  isAvailable: boolean;
  tags: ReadonlyArray<string>;
  allergens: ReadonlyArray<string>;
  optionGroups: ReadonlyArray<MenuItemOptionGroupSnapshot>;
}

export interface CategoryWithItems {
  id: string;
  name: string;
  nameAr: string | null;
  items: ReadonlyArray<MenuItemSnapshot>;
}

/** Inputs every diner theme receives. */
export interface ThemeProps {
  restaurant: RestaurantSnapshot;
  categories: ReadonlyArray<CategoryWithItems>;
  /** Active UI locale (may differ from restaurant.defaultLocale if the diner switched). */
  locale: 'en' | 'ar';
}

/**
 * Diner-facing theme contract. One implementation per theme key.
 * Themes are pure renderers: they never fetch data, never hold state across requests.
 */
export interface ITheme {
  readonly key: string;
  render(props: ThemeProps): ReactNode;
}
