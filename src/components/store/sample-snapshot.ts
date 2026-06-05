// ── Sample data for theme preview — mirrors menu-content.ts in ThemeRenderer types ──
import { CATS, COPY, ITEMS, OFFERS } from './menu-content';
import { THEMES } from './store-data';
import type { CategoryWithItems, MenuItemSnapshot, RestaurantSnapshot } from '@/themes/theme.types';
import type { ThemeKey } from './store-data';
import type { ThemeOverrideDto } from '@/dtos/theme-customization.dto';

/** Convert the hardcoded sample menu into the shape ThemeRenderer expects. Built once. */
export const SAMPLE_CATEGORIES: ReadonlyArray<CategoryWithItems> = (() => {
  const enCats = CATS['en'];
  const arCats = CATS['ar'];
  return enCats.map((cat) => {
    const arCat = arCats.find((c) => c.id === cat.id);
    const items: MenuItemSnapshot[] = ITEMS
      .filter((item) => item.cat === cat.id)
      .map((item) => ({
        id: String(item.id),
        categoryId: cat.id,
        name: item.en.name,
        nameAr: item.ar.name,
        description: item.en.desc,
        descriptionAr: item.ar.desc,
        priceCents: item.price * 100,
        imageUrl: item.image,
        isAvailable: true,
        tags: [...item.tags],
        allergens: [],
        optionGroups: [],
      }));
    return { id: cat.id, name: cat.name, nameAr: arCat?.name ?? null, items };
  });
})();

/**
 * Build a fake RestaurantSnapshot for the theme preview, using the sample "Cafe Nour"
 * identity and the given theme's own color palette so the preview looks as intended.
 */
export function buildSampleSnapshot(
  themeKey: ThemeKey,
  override: ThemeOverrideDto,
  locale: 'en' | 'ar',
): RestaurantSnapshot {
  const token = THEMES[themeKey] ?? THEMES['classic'];
  return {
    id: 'preview-sample',
    slug: 'cafe-nour',
    name: COPY['en'].name,
    nameAr: COPY['ar'].name,
    description: COPY['en'].tagline,
    descriptionAr: COPY['ar'].tagline,
    logoUrl: null,
    whatsappNumber: '+201000000000',
    defaultLocale: locale,
    primaryColor: token.primary,
    secondaryColor: token.secondary,
    accentColor: token.secondary,
    heroPhotos: [],
    heroLayout: 'featured',
    heroImageScale: 1,
    currencyCode: 'EGP',
    taxPercent: 0,
    serviceChargePercent: 0,
    status: 'ACTIVE',
    themeKey,
    themeCustomization: override,
    promoMessages: [...OFFERS[locale]],
  };
}
