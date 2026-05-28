import { getTranslations } from 'next-intl/server';

/**
 * Payment method card.
 * We do NOT store card numbers — Paymob owns that data.
 * We show a notice explaining where card details live and
 * how the owner can update them (by completing a new payment).
 */
export async function PaymentMethodCard(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.billing');
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-sm">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-text-tertiary">{t('paymentMethod')}</p>

      <div className="flex items-center gap-3 rounded-xl bg-surface-sunken p-4">
        <VisaBadge />
        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-semibold text-text-primary">•••• •••• •••• ••••</p>
          <p className="mt-0.5 text-xs text-text-tertiary">{t('paymentManagedBy')}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-text-tertiary">
        <LockIcon />
        {t('securedBy')}
      </div>
    </section>
  );
}

function VisaBadge(): React.JSX.Element {
  return (
    <div className="flex h-8 w-12 shrink-0 items-center justify-center rounded bg-[#1A1F71] text-[9px] font-extrabold tracking-widest text-white">
      VISA
    </div>
  );
}

function LockIcon(): React.JSX.Element {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="5" width="8" height="6" rx="1" />
      <path d="M4 5V3.5a2 2 0 1 1 4 0V5" />
    </svg>
  );
}
