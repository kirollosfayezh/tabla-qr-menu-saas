import { useTranslations } from 'next-intl';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { MenuService } from '@/services/menu.service';
import { MenuClient } from './menu-client';

export const metadata = { title: 'Menu · Tabla' };

/**
 * Owner menu management page.
 * Server: resolves tenant + loads categories/items. Client: handles all mutations
 * with optimistic UI via <MenuClient>.
 */
export default async function MenuPage(): Promise<React.JSX.Element> {
  const ctx = await requireOwnerRestaurant();
  const service = new MenuService();
  const [categories, items] = await Promise.all([
    service.listCategories(ctx.restaurantId),
    service.listItems(ctx.restaurantId),
  ]);

  return (
    <div className="space-y-4">
      <Header />
      <MenuClient
        data={{
          categories,
          items,
          currencyCode: ctx.currencyCode,
          defaultLocale: ctx.defaultLocale,
        }}
      />
    </div>
  );
}

function Header(): React.JSX.Element {
  const t = useTranslations('owner.menu');
  return (
    <header className="space-y-1">
      <h1 className="font-display text-2xl font-semibold text-text-primary">{t('title')}</h1>
      <p className="text-sm text-text-secondary">{t('subtitle')}</p>
    </header>
  );
}
