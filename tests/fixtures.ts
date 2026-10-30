import { randomUUID } from 'node:crypto';
import type {
  MenuItemOptionGroupSnapshot,
  MenuItemSnapshot,
  RestaurantSnapshot,
} from '@/themes/theme.types';

/** Minimal-but-complete snapshots for service tests. Override only what a test cares about. */

export function restaurantSnapshot(overrides: Partial<RestaurantSnapshot> = {}): RestaurantSnapshot {
  return {
    id: randomUUID(),
    slug: 'cafe-nile',
    name: 'Cafe Nile',
    nameAr: 'كافيه النيل',
    description: null,
    descriptionAr: null,
    logoUrl: null,
    whatsappNumber: '+201000000001',
    defaultLocale: 'en',
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#ff6600',
    heroPhotos: [],
    heroLayout: 'featured',
    heroImageScale: 1,
    currencyCode: 'EGP',
    taxPercent: 0,
    serviceChargePercent: 0,
    status: 'ACTIVE',
    themeKey: 'classic',
    themeCustomization: {},
    promoMessages: [],
    ...overrides,
  };
}

export function menuItem(overrides: Partial<MenuItemSnapshot> = {}): MenuItemSnapshot {
  return {
    id: randomUUID(),
    categoryId: randomUUID(),
    name: 'Koshari',
    nameAr: 'كشري',
    description: null,
    descriptionAr: null,
    priceCents: 5000,
    imageUrl: null,
    isAvailable: true,
    tags: [],
    allergens: [],
    optionGroups: [],
    ...overrides,
  };
}

export function optionGroup(
  overrides: Partial<MenuItemOptionGroupSnapshot> = {},
): MenuItemOptionGroupSnapshot {
  return {
    id: randomUUID(),
    name: 'Size',
    nameAr: 'الحجم',
    minSelect: 0,
    maxSelect: 1,
    required: false,
    options: [],
    ...overrides,
  };
}

export function option(label: string, priceDeltaCents = 0): MenuItemOptionGroupSnapshot['options'][number] {
  return { id: randomUUID(), label, labelAr: null, priceDeltaCents };
}
