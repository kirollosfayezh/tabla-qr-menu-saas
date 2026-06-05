'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

export interface PlanDef {
  name: string;
  desc: string;
  monthlyPrice: number;
  yearlyPrice: number;
  cta: string;
  best?: boolean;
  features: string[];
}

interface Props {
  plan: PlanDef;
  yearly: boolean;
  /** DB-sourced price overrides. When provided, these take precedence over the i18n values. */
  monthlyPriceCents?: number;
  yearlyPriceCents?: number;
  /** Theme names included in this plan — shown as chips below the feature list. */
  themes?: string[];
}

/** Single pricing plan card — shared between landing pricing section and standalone /pricing page. */
export function PlanCard({ plan, yearly, monthlyPriceCents, yearlyPriceCents, themes }: Props): React.JSX.Element {
  const t = useTranslations('marketing.pricing');
  // DB prices (cents → EGP) take precedence over i18n hardcoded values
  const monthlyEgp = monthlyPriceCents !== undefined ? monthlyPriceCents / 100 : plan.monthlyPrice;
  const yearlyEgp  = yearlyPriceCents  !== undefined ? yearlyPriceCents  / 100 : plan.yearlyPrice;
  const price = yearly ? yearlyEgp : monthlyEgp;
  const isFree = price === 0;
  const isContactPlan = plan.cta === 'Talk to us' || plan.cta === 'تواصل معنا';
  return (
    <div
      className={cn(
        'relative flex flex-col rounded-2xl p-8 shadow-sm',
        plan.best
          ? 'border-2 border-brand-primary -translate-y-2 shadow-[0_30px_60px_-8px_rgba(255,107,53,0.15)] bg-surface-base'
          : 'border border-border-subtle bg-surface-base',
      )}
    >
      {plan.best && (
        <span className="absolute -top-3 start-8 rounded-full bg-brand-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {t('mostPopular')}
        </span>
      )}

      <p className="font-display text-2xl font-bold tracking-tight text-text-primary">{plan.name}</p>
      <p className="mt-1 text-sm text-text-secondary">{plan.desc}</p>

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display text-[2.75rem] font-extrabold leading-none tracking-tight text-text-primary">
          {isFree ? t('free') : `EGP ${Math.round(price).toLocaleString()}`}
        </span>
        {!isFree && <span className="text-sm text-text-tertiary">/ {t('mo')}</span>}
      </div>

      <Link
        href={isContactPlan ? '#contact' : '/signup'}
        className={cn(
          'mt-5 inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition active:scale-[0.98]',
          plan.best
            ? 'bg-brand-primary text-white hover:bg-brand-primary-dark'
            : 'border border-border-default text-text-primary hover:bg-surface-raised',
        )}
      >
        {plan.cta}
      </Link>

      <hr className="my-6 border-border-subtle" />

      <ul className="flex flex-col gap-3">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm text-text-secondary">
            <CheckCircle />
            {feat}
          </li>
        ))}
      </ul>

      {themes && themes.length > 0 && (
        <div className="mt-5 border-t border-border-subtle pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">Included themes</p>
          <div className="flex flex-wrap gap-1.5">
            {themes.map((name) => (
              <span key={name} className="rounded-full bg-surface-sunken px-2.5 py-1 text-xs font-medium text-text-secondary">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CheckCircle(): React.JSX.Element {
  return (
    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft">
      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden>
        <path d="M2.5 5.5l2 2 4-4" stroke="var(--brand-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
