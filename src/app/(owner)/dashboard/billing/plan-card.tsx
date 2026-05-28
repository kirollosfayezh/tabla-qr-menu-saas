import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/cn';

interface Props {
  status: 'ACTIVE' | 'PENDING_PAYMENT' | 'SUSPENDED';
  themeName: string | null;
  themeIsFree: boolean;
  currencyCode: string;
}

/** Current plan card — design ref: `qrcode menu/owner.jsx` Billing → plan card. */
export async function PlanCard({ status, themeName, themeIsFree, currencyCode }: Props): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.billing');

  const planName = themeIsFree ? t('planFree') : (themeName ?? t('planFree'));
  const price = themeIsFree ? 0 : 290;

  const statusLabel =
    status === 'ACTIVE' ? t('planActive') :
    status === 'PENDING_PAYMENT' ? t('planPending') :
    t('planSuspended');

  const statusClass =
    status === 'ACTIVE' ? 'bg-success/10 text-success' :
    status === 'PENDING_PAYMENT' ? 'bg-warning/10 text-warning' :
    'bg-danger/10 text-danger';

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-sm">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-text-tertiary">{t('planLabel')}</p>
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft">
          <SparkleIcon />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary">{planName}</h2>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', statusClass)}>
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-text-tertiary">
            {price === 0 ? t('freeForever') : t('renewsOn', { date: 'March 1, 2027' })}
          </p>
          {price > 0 && (
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-extrabold tracking-tight text-text-primary">
                {currencyCode} {price.toLocaleString()}
              </span>
              <span className="text-sm text-text-tertiary">{t('perYear')}</span>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard/billing/upgrade"
              className="inline-flex h-9 items-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-white transition hover:bg-brand-primary-dark"
            >
              {t('upgradeTo')}
            </Link>
            <Link
              href="/dashboard/billing/upgrade"
              className="inline-flex h-9 items-center rounded-full border border-border-default px-4 text-sm font-semibold text-text-primary transition hover:bg-surface-raised"
            >
              {t('manage')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function SparkleIcon(): React.JSX.Element {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="var(--brand-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 2l2 6h6l-5 3.5 2 6L11 14l-5 3.5 2-6L3 8h6z" />
    </svg>
  );
}
