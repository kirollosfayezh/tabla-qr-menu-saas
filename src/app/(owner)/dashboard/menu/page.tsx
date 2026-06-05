import { getTranslations } from 'next-intl/server';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { PlanRepository } from '@/repositories/plan.repository';
import { MenuService } from '@/services/menu.service';
import { MenuClient } from './menu-client';
import { DownloadTemplateButton } from './download-template-button';
import { UploadTemplateButton } from './upload-template-button';

export const metadata = { title: 'Menu · Tabla' };

export default async function MenuPage(): Promise<React.JSX.Element> {
  const ctx = await requireOwnerRestaurant();
  const t = await getTranslations('owner.menu');
  const service = new MenuService();

  const restaurant = await new RestaurantRepository().findByOwnerId(ctx.userId);
  if (!restaurant) throw new Error('Restaurant missing');

  const plan = await new PlanRepository().findByKey(restaurant.planKey)
    ?? await new PlanRepository().findByKey('free_trial');
  const maxItems      = plan?.maxItems      ?? 5;
  const maxCategories = plan?.maxCategories ?? 5;

  const [categories, items] = await Promise.all([
    service.listCategories(ctx.restaurantId),
    service.listItems(ctx.restaurantId),
  ]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-text-primary">{t('title')}</h1>
          <p className="text-sm text-text-secondary">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-start justify-end gap-2">
          <DownloadTemplateButton />
          <UploadTemplateButton />
        </div>
      </header>
      <MenuClient
        data={{
          categories,
          items,
          currencyCode: ctx.currencyCode,
          defaultLocale: ctx.defaultLocale,
          maxItems,
          maxCategories,
        }}
      />
    </div>
  );
}
