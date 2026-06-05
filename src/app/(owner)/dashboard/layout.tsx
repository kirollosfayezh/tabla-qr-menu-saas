import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import type { Session } from 'next-auth';
import type { User } from '@prisma/client';
import { auth } from '@/lib/auth/auth';
import { UserRepository } from '@/repositories/user.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { PlanRepository } from '@/repositories/plan.repository';
import { AdminPlanRepository } from '@/repositories/admin/admin-plan.repository';
import { prisma } from '@/repositories/prisma.client';
import { isTrialExpired } from '@/config/plans';
import { Sidebar } from '@/components/owner/sidebar';
import { Topbar } from '@/components/owner/topbar';
import { PlanBanner } from '@/components/owner/plan-banner';
import { TrialEndedGate } from '@/components/owner/trial-ended-gate';

interface TopbarDisplay {
  name: string;
  email: string;
  image: string | null;
}

function firstNonEmpty(...candidates: ReadonlyArray<string | null | undefined>): string {
  for (const c of candidates) {
    if (c && c.length > 0) return c;
  }
  return '';
}

function buildTopbarDisplay(user: User | null, session: Session): TopbarDisplay {
  const sessionUser = session.user;
  return {
    name: firstNonEmpty(user?.name, sessionUser?.name, sessionUser?.email, 'Owner'),
    email: firstNonEmpty(user?.email, sessionUser?.email),
    image: user?.image ?? null,
  };
}

export default async function DashboardLayout({ children }: { children: ReactNode }): Promise<React.JSX.Element> {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');
  if (session.user.role === 'ADMIN') redirect('/admin');

  const restaurant = await new RestaurantRepository().findByOwnerId(session.user.id);
  if (!restaurant) redirect('/onboarding');

  if (isTrialExpired(restaurant.planKey, restaurant.trialEndsAt)) {
    const [allPlans, currentPlan] = await Promise.all([
      new AdminPlanRepository().listAll(),
      new PlanRepository().findByKey(restaurant.planKey),
    ]);
    return (
      <TrialEndedGate
        plans={allPlans}
        currentPlanKey={restaurant.planKey}
        currentMonthlyPriceCents={currentPlan?.monthlyPriceCents ?? 0}
        currencyCode={restaurant.currencyCode}
      />
    );
  }

  const [plan, itemCount] = await Promise.all([
    new PlanRepository().findByKey(restaurant.planKey)
      .then((p) => p ?? new PlanRepository().findByKey('free_trial')),
    prisma.menuItem.count({ where: { restaurantId: restaurant.id } }),
  ]);
  const planKey = plan?.key ?? 'free_trial';
  const planLimits = { maxItems: plan?.maxItems ?? 5, maxCategories: plan?.maxCategories ?? 5 };

  const user = await new UserRepository().findById(session.user.id);
  const display = buildTopbarDisplay(user, session);

  const t = await getTranslations('owner.plan');

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--surface-sunken, #f4f4f6)' }}>
      <aside
        className="hidden w-64 shrink-0 flex-col border-e border-border-subtle lg:flex"
        style={{ backgroundColor: 'var(--surface-base, #ffffff)' }}
      >
        <div className="flex flex-1 flex-col overflow-y-auto">
          <Sidebar />
        </div>
        <PlanBanner
          planKey={planKey}
          planLabel={t(planKey)}
          limitsLabel={t('itemsUsed', { used: itemCount, max: planLimits.maxItems >= 999999 ? '∞' : planLimits.maxItems })}
          upgradeHint={t('upgradeHint')}
          upgradeBtn={t('upgradeBtn')}
        />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={display} planKey={planKey} planLabel={t(planKey)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
