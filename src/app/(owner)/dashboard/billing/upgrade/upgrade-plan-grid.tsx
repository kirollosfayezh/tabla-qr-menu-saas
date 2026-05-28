'use client';

/* eslint-disable max-lines-per-function */

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { AdminPlanRow } from '@/repositories/admin/admin-plan.repository';

interface Props {
  plans: AdminPlanRow[];
  currentPlanKey: string;
  currentMonthlyPriceCents: number;
  currencyCode: string;
}

/**
 * Shows all plans side-by-side. Smart pricing: if the user is already on a paid plan,
 * higher-tier upgrades show only the *difference* they need to pay.
 */
export function UpgradePlanGrid({ plans, currentPlanKey, currentMonthlyPriceCents, currencyCode }: Props): React.JSX.Element {
  const t = useTranslations('owner.upgrade');
  const currentIndex = plans.findIndex((p) => p.key === currentPlanKey);

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      {plans.map((plan, index) => {
        const isCurrent = plan.key === currentPlanKey;
        const isUpgrade = index > currentIndex && currentIndex >= 0;
        const isDowngrade = index < currentIndex;
        const diffCents = isUpgrade ? Math.max(0, plan.monthlyPriceCents - currentMonthlyPriceCents) : 0;

        return (
          <PlanCard
            key={plan.key}
            plan={plan}
            isCurrent={isCurrent}
            isUpgrade={isUpgrade}
            isDowngrade={isDowngrade}
            diffCents={diffCents}
            currentMonthlyPriceCents={currentMonthlyPriceCents}
            currencyCode={currencyCode}
            t={t}
          />
        );
      })}
    </div>
  );
}

interface CardProps {
  plan: AdminPlanRow;
  isCurrent: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  diffCents: number;
  currentMonthlyPriceCents: number;
  currencyCode: string;
  t: ReturnType<typeof useTranslations<'owner.upgrade'>>;
}

function PlanCard({ plan, isCurrent, isUpgrade, isDowngrade, diffCents, currentMonthlyPriceCents, currencyCode, t }: CardProps): React.JSX.Element {
  const isFree = plan.monthlyPriceCents === 0;
  const showDiff = isUpgrade && currentMonthlyPriceCents > 0 && diffCents > 0;
  const displayPrice = showDiff ? diffCents : plan.monthlyPriceCents;

  return (
    <div className={cn(
      'relative flex flex-col rounded-2xl border-2 p-6',
      isCurrent ? 'border-brand-primary bg-brand-primary-soft/10' :
      isUpgrade ? 'border-border-subtle bg-surface-base shadow-sm hover:border-brand-primary/40 transition-colors' :
      'border-border-subtle bg-surface-base opacity-60',
    )}>
      {isCurrent && (
        <span className="absolute -top-3 start-6 rounded-full bg-brand-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          {t('currentPlan')}
        </span>
      )}

      <h2 className="font-display text-xl font-bold text-text-primary">{plan.name}</h2>
      {plan.nameAr && <p className="text-xs text-text-tertiary">{plan.nameAr}</p>}

      <div className="mt-4 flex items-baseline gap-1.5">
        {isFree ? (
          <span className="font-display text-3xl font-extrabold text-text-primary">{t('free')}</span>
        ) : (
          <>
            <span className="font-display text-3xl font-extrabold text-text-primary">
              {currencyCode} {Math.round(displayPrice / 100).toLocaleString()}
            </span>
            <span className="text-sm text-text-tertiary">/ {t('mo')}</span>
          </>
        )}
      </div>

      {showDiff && (
        <p className="mt-1 text-xs text-success font-semibold">
          {t('diffHint', { amount: `${currencyCode} ${Math.round(currentMonthlyPriceCents / 100)}` })}
        </p>
      )}

      <ul className="mt-4 flex flex-col gap-2">
        <Feature label={t('items', { n: plan.maxItems >= 999999 ? '∞' : plan.maxItems })} />
        <Feature label={t('categories', { n: plan.maxCategories >= 999999 ? '∞' : plan.maxCategories })} />
        <Feature label={t('themes', { n: plan.accessibleThemes.length })} />
      </ul>

      <div className="mt-5">
        {isCurrent ? (
          <span className="flex h-10 items-center justify-center rounded-full bg-surface-raised text-sm font-semibold text-text-tertiary">
            {t('currentPlan')}
          </span>
        ) : isUpgrade ? (
          <Link
            href="/dashboard/theme"
            className="flex h-10 items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white transition hover:bg-brand-primary-dark"
          >
            {t('upgrade')} →
          </Link>
        ) : (
          <span className="flex h-10 items-center justify-center rounded-full border border-border-default text-sm text-text-tertiary">
            {t('downgrade')}
          </span>
        )}
      </div>
    </div>
  );
}

function Feature({ label }: { label: string }): React.JSX.Element {
  return (
    <li className="flex items-center gap-2 text-sm text-text-secondary">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <circle cx="7" cy="7" r="6" fill="var(--brand-primary-soft)" />
        <path d="M4 7l2 2 4-4" stroke="var(--brand-primary)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </li>
  );
}
