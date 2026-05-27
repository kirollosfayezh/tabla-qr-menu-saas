import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { getLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { PUBLIC_MENU_REVALIDATE_SECONDS } from '@/config/constants';
import { PublicMenuService } from '@/services/public-menu.service';
import { ThemeRenderer } from '@/themes/theme.renderer';
import { checkThemeRegistrySync } from '@/themes/sync-check';
import type { SupportedLocale } from '@/i18n/config';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Public diner page.
 * - Resolves the tenant menu by slug.
 * - 404 if no such restaurant.
 * - Renders the SUSPENDED notice instead of the menu when the restaurant is suspended.
 * - Otherwise hands off to the active theme via <ThemeRenderer>.
 */
export default async function TenantPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  void checkThemeRegistrySync();

  const menu = await getCachedMenu(slug);
  if (!menu) notFound();

  const locale = (await getLocale()) as SupportedLocale;
  const dinerLocale: 'en' | 'ar' = locale === 'ar' ? 'ar' : 'en';

  if (menu.restaurant.status === 'SUSPENDED') {
    return <SuspendedNotice accentColor={menu.restaurant.accentColor} secondaryColor={menu.restaurant.secondaryColor} />;
  }

  return (
    <ThemeRenderer
      restaurant={menu.restaurant}
      categories={menu.categories}
      locale={dinerLocale}
    />
  );
}

const getCachedMenu = unstable_cache(
  async (slug: string) => new PublicMenuService().findBySlug(slug),
  ['public-menu'],
  { revalidate: PUBLIC_MENU_REVALIDATE_SECONDS },
);

async function SuspendedNotice({
  accentColor,
  secondaryColor,
}: {
  accentColor: string;
  secondaryColor: string;
}): Promise<React.JSX.Element> {
  const t = await getTranslations('tenant');
  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 text-center"
      style={{ backgroundColor: accentColor, color: secondaryColor }}
    >
      <p className="text-base">{t('menuUnavailable')}</p>
    </main>
  );
}
