import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { ThemeGallery } from './theme-gallery';
import type { SupportedLocale } from '@/i18n/config';

export const metadata = { title: 'Theme · Tabla' };

export default async function ThemePage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner');
  const ctx = await requireOwnerRestaurant();
  const restaurant = await new RestaurantRepository().findByOwnerId(ctx.userId);
  const themes = await new ThemeRepository().listActive();
  const locale = ((await getLocale()) as SupportedLocale) === 'ar' ? 'ar' : 'en';
  return (
    <div className="space-y-6">
      <PageHeader title={t('theme.title')} description={t('theme.subtitle')} />
      <ThemeGallery
        themes={themes}
        currentThemeId={restaurant?.themeId ?? null}
        currencyCode={ctx.currencyCode}
        locale={locale}
      />
    </div>
  );
}
