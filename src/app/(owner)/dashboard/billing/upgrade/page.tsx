import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { AdminPlanRepository } from '@/repositories/admin/admin-plan.repository';
import { PlanRepository } from '@/repositories/plan.repository';
import { PaymentMethodRepository } from '@/repositories/payment-method.repository';
import { toMethodIds } from '@/lib/payments/payment-methods';
import { UpgradePlanGrid } from './upgrade-plan-grid';

export const metadata = { title: 'Upgrade plan · Tabla' };

export default async function UpgradePage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.upgrade');
  const ctx = await requireOwnerRestaurant();

  const restaurant = await new RestaurantRepository().findByOwnerId(ctx.userId);
  if (!restaurant) throw new Error('Restaurant missing');

  const [allPlans, currentPlan, activePaymentMethods] = await Promise.all([
    new AdminPlanRepository().listAll(),
    new PlanRepository().findByKey(restaurant.planKey),
    new PaymentMethodRepository().listActiveKeys(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <UpgradePlanGrid
        plans={allPlans}
        currentPlanKey={restaurant.planKey}
        currentMonthlyPriceCents={currentPlan?.monthlyPriceCents ?? 0}
        currencyCode={restaurant.currencyCode}
        activePaymentMethods={toMethodIds(activePaymentMethods)}
      />
    </div>
  );
}
