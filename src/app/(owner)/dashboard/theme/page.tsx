import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { ThemeRepository } from '@/repositories/theme.repository';
import { ThemeGallery } from './theme-gallery';
import { env } from '@/config/env';
import type { SupportedLocale } from '@/i18n/config';

export const metadata = { title: 'Theme · Tabla' };

/**
 * Paymob checkout is enabled whenever the API key + HMAC + integration id are set —
 * regardless of NODE_ENV. In development, point Paymob's webhook URL at a tunnel (ngrok,
 * cloudflared, etc.) so the success/failed callback can reach the local server.
 */
function paymentsEnabled(): boolean {
  return Boolean(env.PAYMOB_API_KEY && env.PAYMOB_HMAC_SECRET && env.PAYMOB_INTEGRATION_ID);
}

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
        paymentsEnabled={paymentsEnabled()}
      />
    </div>
  );
}
