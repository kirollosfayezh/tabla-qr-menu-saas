import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { BillingRepository } from '@/repositories/billing.repository';
import { AdminPlanRepository } from '@/repositories/admin/admin-plan.repository';
import { PlanCard } from './plan-card';
import { PaymentMethodCard } from './payment-method-card';
import { PaymentHistoryTable } from './payment-history-table';

export const metadata = { title: 'Billing · Tabla' };

export default async function BillingPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.billing');
  const ctx = await requireOwnerRestaurant();

  const [restaurant, payments, allPlans] = await Promise.all([
    new RestaurantRepository().findByOwnerId(ctx.userId),
    new BillingRepository().listPayments(ctx.restaurantId),
    new AdminPlanRepository().listAll(),
  ]);

  if (!restaurant) throw new Error('Restaurant missing');

  const currentPlan = allPlans.find((p) => p.key === restaurant.planKey);
  const maxSortOrder = Math.max(...allPlans.map((p) => p.sortOrder));
  const canUpgrade = (currentPlan?.sortOrder ?? 0) < maxSortOrder;

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      <div className="grid gap-5 lg:grid-cols-2">
        <PlanCard
          status={restaurant.status}
          planName={currentPlan?.name ?? t('planFree')}
          yearlyPriceCents={currentPlan?.yearlyPriceCents ?? 0}
          canUpgrade={canUpgrade}
          currencyCode={restaurant.currencyCode}
        />
        <PaymentMethodCard />
      </div>

      <PaymentHistoryTable payments={payments} currencyCode={restaurant.currencyCode} />
    </div>
  );
}
