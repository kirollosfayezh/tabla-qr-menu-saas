'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PlanCard, type PlanDef } from './plan-card';
import { BillingToggle } from './marketing-pricing';
import type { PublicPlanPrice } from '@/repositories/plan.repository';

interface Props {
  dbPrices?: PublicPlanPrice[];
}

/**
 * Standalone /pricing page body.
 * Prices come from DB (passed by the server page) so admin changes reflect immediately.
 */
export function PricingPageContent({ dbPrices }: Props): React.JSX.Element {
  const t = useTranslations('marketing.pricing');
  const [yearly, setYearly] = useState(true);
  const plans = t.raw('plans') as PlanDef[];
  return (
    <>
      <section className="bg-gradient-to-b from-surface-raised to-surface-base py-20 text-center">
        <div className="mx-auto max-w-4xl px-6">
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-text-primary sm:text-[3.5rem]">
            {t('heading')}
          </h1>
          <p className="mt-4 text-lg text-text-secondary">{t('sub')}</p>
          <BillingToggle yearly={yearly} onChange={setYearly} />
        </div>
      </section>

      <section className="bg-surface-base pb-20 pt-8">
        <div className="mx-auto grid max-w-5xl gap-5 px-6 sm:grid-cols-3">
          {plans.map((plan, index) => {
            const dbPlan = dbPrices?.[index];
            return (
              <PlanCard
                key={plan.name}
                plan={plan}
                yearly={yearly}
                monthlyPriceCents={dbPlan?.monthlyPriceCents}
                yearlyPriceCents={dbPlan?.yearlyPriceCents}
              />
            );
          })}
        </div>
      </section>
    </>
  );
}
