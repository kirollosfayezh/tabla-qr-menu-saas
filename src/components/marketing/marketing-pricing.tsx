'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { PlanCard, type PlanDef } from './plan-card';
import type { PublicPlanPrice } from '@/repositories/plan.repository';

interface Props {
  /** DB plan prices keyed by plan key. When provided, overrides i18n hardcoded prices. */
  dbPrices?: PublicPlanPrice[];
}

/** Landing-page inline pricing section with monthly/yearly billing toggle. */
export function MarketingPricing({ dbPrices }: Props): React.JSX.Element {
  const t = useTranslations('marketing.pricing');
  const [yearly, setYearly] = useState(true);
  const plans = t.raw('plans') as PlanDef[];
  return (
    <section id="pricing" className="bg-surface-base py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-primary">{t('label')}</p>
          <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">{t('heading')}</h2>
          <p className="mt-3 text-lg text-text-secondary">{t('sub')}</p>
          <BillingToggle yearly={yearly} onChange={setYearly} />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
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
      </div>
    </section>
  );
}

export function BillingToggle({ yearly, onChange }: { yearly: boolean; onChange: (v: boolean) => void }): React.JSX.Element {
  const t = useTranslations('marketing.pricing');
  return (
    <div className="mt-7 inline-flex rounded-full border border-border-subtle bg-surface-raised p-1">
      <ToggleBtn label={t('monthly')} active={!yearly} onClick={() => onChange(false)} />
      <ToggleBtn label={`${t('yearly')} · ${t('yearlySave')}`} active={yearly} onClick={() => onChange(true)} />
    </div>
  );
}

function ToggleBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-8 rounded-full px-4 text-sm font-semibold transition',
        active ? 'bg-white text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary',
      )}
    >
      {label}
    </button>
  );
}
