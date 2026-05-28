import { getTranslations } from 'next-intl/server';
import type { Payment } from '@prisma/client';
import { cn } from '@/lib/cn';

interface Props {
  payments: Payment[];
  currencyCode: string;
}

/** Payment history table — design ref: `qrcode menu/owner.jsx` Billing → history table. */
export async function PaymentHistoryTable({ payments, currencyCode }: Props): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.billing');
  return (
    <section className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-base shadow-sm">
      <header className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="font-display text-base font-bold text-text-primary">{t('historyTitle')}</h2>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border-default px-3 text-xs font-semibold text-text-secondary transition hover:bg-surface-raised"
        >
          <DownloadIcon />
          {t('downloadAll')}
        </button>
      </header>

      {payments.length === 0 ? (
        <p className="px-5 pb-8 pt-4 text-center text-sm text-text-tertiary">{t('noPayments')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-t border-border-subtle bg-surface-raised text-text-tertiary">
                <Th>{t('colDate')}</Th>
                <Th>{t('colDescription')}</Th>
                <Th>{t('colStatus')}</Th>
                <Th>{t('colAmount')}</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} currencyCode={currencyCode} t={t} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PaymentRow({ payment, currencyCode, t }: { payment: Payment; currencyCode: string; t: Awaited<ReturnType<typeof getTranslations<'owner.billing'>>> }): React.JSX.Element {
  const date = (payment.paidAt ?? payment.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const description = payment.themeId
    ? `Theme purchase`
    : `Subscription · ${payment.currencyCode}`;
  const amount = (payment.amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 });

  const { label, cls } = statusChip(payment.status, t);

  return (
    <tr className="border-t border-border-subtle hover:bg-surface-raised/50 transition-colors">
      <Td className="text-text-secondary">{date}</Td>
      <Td>{description}</Td>
      <Td>
        <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', cls)}>
          {label}
        </span>
      </Td>
      <Td className="font-mono font-semibold text-text-primary">{currencyCode} {amount}</Td>
      <Td className="text-end">
        <button type="button" className="h-7 rounded-full border border-border-default px-3 text-xs font-semibold text-text-secondary transition hover:bg-surface-raised">
          {t('invoice')}
        </button>
      </Td>
    </tr>
  );
}

function statusChip(status: Payment['status'], t: Awaited<ReturnType<typeof getTranslations<'owner.billing'>>>): { label: string; cls: string } {
  switch (status) {
    case 'SUCCESS':  return { label: t('statusPaid'),     cls: 'bg-success/10 text-success' };
    case 'FAILED':   return { label: t('statusFailed'),   cls: 'bg-danger/10 text-danger' };
    case 'REFUNDED': return { label: t('statusRefunded'), cls: 'bg-warning/10 text-warning' };
    default:         return { label: t('statusPending'),  cls: 'bg-surface-sunken text-text-tertiary' };
  }
}

function Th({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return <th className="px-5 py-2.5 text-start text-xs font-semibold uppercase tracking-[0.04em]">{children}</th>;
}

function Td({ children, className }: { children?: React.ReactNode; className?: string }): React.JSX.Element {
  return <td className={cn('px-5 py-3.5 text-text-secondary', className)}>{children}</td>;
}

function DownloadIcon(): React.JSX.Element {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 2v7M3.5 6l3 3 3-3M2 11h9" />
    </svg>
  );
}
