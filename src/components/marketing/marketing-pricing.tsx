'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { PlanCard, type PlanDef } from './plan-card';
import type { PublicPlanWithThemes } from '@/repositories/plan.repository';

interface Props {
  dbPlans?: PublicPlanWithThemes[];
}

export function MarketingPricing({ dbPlans }: Props): React.JSX.Element {
  const t = useTranslations('marketing.pricing');
  const [yearly, setYearly] = useState(true);

  // DB plans are the source of truth when available.
  // Fall back to i18n hardcoded plans only when DB is empty (e.g. before first seed).
  const i18nPlans = t.raw('plans') as PlanDef[];
  const hasDbPlans = (dbPlans?.length ?? 0) > 0;

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
          {hasDbPlans
            ? dbPlans!.map((dbPlan, i) => {
                const i18n = i18nPlans[i];
                return (
                  <PlanCard
                    key={dbPlan.key}
                    plan={i18n ?? {
                      name: dbPlan.name,
                      desc: dbPlan.nameAr ?? '',
                      monthlyPrice: dbPlan.monthlyPriceCents / 100,
                      yearlyPrice: dbPlan.yearlyPriceCents / 100,
                      cta: 'Get started',
                      features: [],
                    }}
                    yearly={yearly}
                    monthlyPriceCents={dbPlan.monthlyPriceCents}
                    yearlyPriceCents={dbPlan.yearlyPriceCents}
                    themes={dbPlan.themes.map((th) => th.name)}
                  />
                );
              })
            : i18nPlans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} yearly={yearly} />
              ))}
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
