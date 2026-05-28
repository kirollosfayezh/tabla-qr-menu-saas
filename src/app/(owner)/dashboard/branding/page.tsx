import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { MenuService } from '@/services/menu.service';
import { BrandingForm } from './branding-form';
import type { CategoryWithItems } from '@/themes/theme.types';
import { parseHeroPhotos } from '@/lib/hero-photos';

export const metadata = { title: 'Branding · Tabla' };

export default async function BrandingPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.branding');
  const ctx = await requireOwnerRestaurant();
  const restaurant = await new RestaurantRepository().findByOwnerId(ctx.userId);
  if (!restaurant) throw new Error('Restaurant missing');
  const theme = restaurant.themeId ? await new ThemeRepository().findById(restaurant.themeId) : null;
  const menu = new MenuService();
  const [categories, items] = await Promise.all([
    menu.listCategories(restaurant.id),
    menu.listItems(restaurant.id),
  ]);
  const previewCategories: CategoryWithItems[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
    nameAr: category.nameAr,
    items: items
      .filter((item) => item.categoryId === category.id)
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
  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <BrandingForm
        initial={{
          name: restaurant.name,
          nameAr: restaurant.nameAr ?? '',
          description: restaurant.description ?? '',
          descriptionAr: restaurant.descriptionAr ?? '',
          logoUrl: restaurant.logoUrl ?? '',
          primaryColor: restaurant.primaryColor,
          secondaryColor: restaurant.secondaryColor,
          accentColor: restaurant.accentColor,
          heroPhotos: parseHeroPhotos(restaurant.heroPhotos, restaurant.heroImageUrls),
          heroLayout: restaurant.heroLayout === 'grid' || restaurant.heroLayout === 'strip' || restaurant.heroLayout === 'stack' ? restaurant.heroLayout : 'featured',
          heroImageScale: restaurant.heroImageScale,
          currencyCode: restaurant.currencyCode,
          themeKey: theme?.key ?? 'classic',
        }}
        previewCategories={previewCategories}
        publicMenuHref={`/t/${restaurant.slug}`}
      />
    </div>
  );
}
