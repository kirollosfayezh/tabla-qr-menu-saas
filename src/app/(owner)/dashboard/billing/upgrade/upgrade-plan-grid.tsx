'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { checkoutPlanAction } from '@/app/actions/payment.actions';
import { openBlankPopup, openCheckout } from '@/lib/checkout-popup';
import { PaymentMethodSheet } from '@/components/owner/payment-method-sheet';
import { InstapayModal } from '@/components/owner/instapay-modal';
import type { AdminPlanRow } from '@/repositories/admin/admin-plan.repository';
import type { PaymentMethodId } from '@/lib/payments/payment-methods';

interface Props {
  plans: AdminPlanRow[];
  currentPlanKey: string;
  currentMonthlyPriceCents: number;
  currencyCode: string;
  activePaymentMethods: ReadonlyArray<PaymentMethodId>;
}

export function UpgradePlanGrid({ plans, currentPlanKey, currentMonthlyPriceCents, currencyCode, activePaymentMethods }: Props): React.JSX.Element {
  const t = useTranslations('owner.upgrade');
  const currentIndex = plans.findIndex((p) => p.key === currentPlanKey);
  const [selectedPlan, setSelectedPlan] = useState<AdminPlanRow | null>(null);
  const [showInstapay, setShowInstapay] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (event.origin === window.location.origin && (event.data as { type?: string })?.type === 'tabla:payment-return') {
        window.location.reload();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  function handleMethodSelect(method: PaymentMethodId): void {
    if (!selectedPlan) return;
    if (method === 'instapay') {
      setShowInstapay(true);
      return;
    }
    setError(null);
    const popup = openBlankPopup();
    startTransition(async () => {
      const res = await checkoutPlanAction({ planKey: selectedPlan.key, method });
      setSelectedPlan(null);
      if (!res.ok) { popup?.close(); setError(res.message); return; }
      if (res.value.redirectUrl) openCheckout(res.value.redirectUrl, popup);
      else { popup?.close(); window.location.reload(); }
    });
  }

  const diffFor = (plan: AdminPlanRow, index: number): number => {
    const isUpgrade = index > currentIndex && currentIndex >= 0;
    return isUpgrade ? Math.max(0, plan.monthlyPriceCents - currentMonthlyPriceCents) : 0;
  };

  return (
    <>
      <div className="space-y-4">
        {error && <p className="rounded-lg bg-danger/10 px-4 py-2 text-sm text-danger">{error}</p>}
        <div className="grid gap-5 sm:grid-cols-3">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.key}
              plan={plan}
              isCurrent={plan.key === currentPlanKey}
              isUpgrade={index > currentIndex && currentIndex >= 0}
              isDowngrade={index < currentIndex}
              diffCents={diffFor(plan, index)}
              currentMonthlyPriceCents={currentMonthlyPriceCents}
              currencyCode={currencyCode}
              pending={pending && selectedPlan?.key === plan.key}
              onUpgrade={() => { setError(null); setSelectedPlan(plan); }}
              t={t}
            />
          ))}
        </div>
      </div>

      {selectedPlan && !showInstapay && (
        <PaymentMethodSheet
          planName={selectedPlan.name}
          availableMethods={activePaymentMethods}
          pending={pending}
          onSelect={handleMethodSelect}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      {selectedPlan && showInstapay && (
        <InstapayModal
          target={{ kind: 'plan', key: selectedPlan.key, name: selectedPlan.name }}
          onClose={() => { setShowInstapay(false); setSelectedPlan(null); }}
          onSuccess={() => { setShowInstapay(false); setSelectedPlan(null); window.location.reload(); }}
        />
      )}
    </>
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
  pending: boolean;
  onUpgrade: () => void;
  t: ReturnType<typeof useTranslations<'owner.upgrade'>>;
}

function PlanCard({ plan, isCurrent, isUpgrade, diffCents, currentMonthlyPriceCents, currencyCode, pending, onUpgrade, t }: CardProps): React.JSX.Element {
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
          <span className="flex h-10 items-center justify-center rounded-full bg-surface-raised text-sm font-semibold text-text-tertiary">{t('currentPlan')}</span>
        ) : !isUpgrade ? (
          <span className="flex h-10 items-center justify-center rounded-full border border-border-default text-sm text-text-tertiary">{t('downgrade')}</span>
        ) : (
          <button
            type="button"
            onClick={onUpgrade}
            disabled={pending}
            className="flex h-10 w-full items-center justify-center rounded-full bg-brand-primary text-sm font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
          >
            {pending ? t('opening') : `${t('upgrade')} →`}
          </button>
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
