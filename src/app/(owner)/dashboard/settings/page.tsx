import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { PlanRepository } from '@/repositories/plan.repository';
import { MenuService } from '@/services/menu.service';
import { PlanChip } from '@/components/owner/plan-chip';
import { SettingsForm } from './settings-form';

export const metadata = { title: 'Settings · Tabla' };

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.settings');
  const tp = await getTranslations('owner.plan');
  const ctx = await requireOwnerRestaurant();

  const restaurant = await new RestaurantRepository().findByOwnerId(ctx.userId);
  if (!restaurant) throw new Error('Restaurant missing');

  const [plan, items] = await Promise.all([
    new PlanRepository().findByKey(restaurant.planKey)
      .then((p) => p ?? new PlanRepository().findByKey('free_trial')),
    new MenuService().listItems(ctx.restaurantId),
  ]);

  const planKey = plan?.key ?? 'free_trial';
  const maxItems = plan?.maxItems ?? 5;
  const maxCategories = plan?.maxCategories ?? 5;
  const usedItems = items.length;

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      <section className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-text-tertiary">{tp('planLabel')}</p>
        <div className="flex flex-wrap items-center gap-3">
          <PlanChip planKey={planKey} label={tp(planKey)} />
          <span className="text-sm text-text-secondary">
            {maxItems >= 999999
              ? tp('itemsUsed', { used: usedItems, max: '∞' })
              : tp('itemsUsed', { used: usedItems, max: maxItems })}
          </span>
          <span className="text-text-tertiary">·</span>
          <span className="text-sm text-text-tertiary">
            {maxCategories >= 999999 ? '∞' : maxCategories} {tp('categoriesLabel')}
          </span>
          {planKey === 'free_trial' && (
            <Link href="/dashboard/billing" className="ms-auto text-sm font-semibold text-brand-primary hover:underline">
              {tp('upgradeBtn')} →
            </Link>
          )}
        </div>
      </section>

      <SettingsForm
        initial={{
          whatsappNumber: restaurant.whatsappNumber,
          currencyCode: restaurant.currencyCode,
          defaultLocale: restaurant.defaultLocale,
          taxPercent: Number(restaurant.taxPercent),
          serviceChargePercent: Number(restaurant.serviceChargePercent),
        }}
      />
    </div>
  );
}
