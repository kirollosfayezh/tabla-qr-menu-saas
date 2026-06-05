import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { PlanRepository } from '@/repositories/plan.repository';
import { PaymentMethodRepository } from '@/repositories/payment-method.repository';
import { MenuService } from '@/services/menu.service';
import { ThemeOverrideSchema, THEME_STORE_KEYS } from '@/dtos/theme-customization.dto';
import { parseHeroPhotos } from '@/lib/hero-photos';
import { toMethodIds } from '@/lib/payments/payment-methods';
import { ThemeStudio } from './theme-studio';
import type { ThemeKey } from '@/components/store/store-data';
import type { ThemeOverrideDto } from '@/dtos/theme-customization.dto';
import type { CategoryWithItems, RestaurantSnapshot } from '@/themes/theme.types';
import type { ThemeRow } from './theme-studio';

export const metadata = { title: 'Theme · Tabla' };

function isStoreKey(key: string | undefined): key is ThemeKey {
  return key !== undefined && (THEME_STORE_KEYS as ReadonlyArray<string>).includes(key);
}

export default async function ThemePage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner');
  const ctx = await requireOwnerRestaurant();
  const restaurant = await new RestaurantRepository().findByOwnerId(ctx.userId);
  if (!restaurant) throw new Error('Restaurant missing');

  const menu = new MenuService();
  const [allThemes, plan, categories, items, activePaymentMethods] = await Promise.all([
    new ThemeRepository().listActive(),
    restaurant.planKey ? new PlanRepository().findByKey(restaurant.planKey) : Promise.resolve(null),
    menu.listCategories(restaurant.id),
    menu.listItems(restaurant.id),
    new PaymentMethodRepository().listActiveKeys(),
  ]);

  const planThemeIds = new Set(plan?.accessibleThemes.map((pt) => pt.theme.id) ?? []);
  const currentTheme = allThemes.find((th) => th.id === restaurant.themeId) ?? null;
  const currentThemeKey: ThemeKey | null = isStoreKey(currentTheme?.key) ? currentTheme.key : null;

  const parsed = ThemeOverrideSchema.safeParse(restaurant.themeCustomization ?? {});
  const initialOverride: ThemeOverrideDto = parsed.success ? parsed.data : {};

  const themes: ThemeRow[] = allThemes
    .filter((th) => isStoreKey(th.key))
    .map((th) => ({
      id: th.id,
      key: th.key as ThemeKey,
      name: th.name,
      isFree: th.isFree,
      priceCents: th.priceCents,
      isInPlan: planThemeIds.has(th.id),
      currencyCode: restaurant.currencyCode,
    }));

  const previewCategories: CategoryWithItems[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    nameAr: cat.nameAr,
    items: items
      .filter((item) => item.categoryId === cat.id)
      .map((item) => ({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        nameAr: item.nameAr,
        description: item.description,
        descriptionAr: item.descriptionAr,
        priceCents: item.priceCents,
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable,
        tags: item.tags,
        allergens: item.allergens,
        optionGroups: [],
      })),
  }));

  const restaurantSnapshot: RestaurantSnapshot = {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    nameAr: restaurant.nameAr,
    description: restaurant.description,
    descriptionAr: restaurant.descriptionAr,
    logoUrl: restaurant.logoUrl,
    whatsappNumber: restaurant.whatsappNumber,
    defaultLocale: restaurant.defaultLocale as 'en' | 'ar',
    primaryColor: restaurant.primaryColor,
    secondaryColor: restaurant.secondaryColor,
    accentColor: restaurant.accentColor,
    heroPhotos: parseHeroPhotos(restaurant.heroPhotos, restaurant.heroImageUrls),
    heroLayout: ['featured', 'grid', 'strip', 'stack'].includes(restaurant.heroLayout ?? '') ? (restaurant.heroLayout as RestaurantSnapshot['heroLayout']) : 'featured',
    heroImageScale: restaurant.heroImageScale,
    currencyCode: restaurant.currencyCode,
    taxPercent: Number(restaurant.taxPercent),
    serviceChargePercent: Number(restaurant.serviceChargePercent),
    status: restaurant.status as RestaurantSnapshot['status'],
    themeKey: currentThemeKey ?? 'classic',
    themeCustomization: initialOverride as ThemeOverrideDto,
    promoMessages: restaurant.promoMessages ?? [],
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t('theme.title')} description={t('theme.subtitle')} />
      <ThemeStudio
        currentThemeKey={currentThemeKey}
        initialOverride={initialOverride}
        themes={themes}
        restaurant={restaurantSnapshot}
        categories={previewCategories}
        activePaymentMethods={toMethodIds(activePaymentMethods)}
      />
    </div>
  );
}
