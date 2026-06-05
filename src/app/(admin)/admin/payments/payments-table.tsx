'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { PaymentStatus } from '@prisma/client';
import type { AdminPaymentRow } from '@/repositories/admin/admin-payment.repository';
import { confirmManualPaymentAction, refundPaymentAction } from '@/app/actions/admin.actions';

const STATUS_KEYS: ReadonlyArray<{ value: '' | PaymentStatus; key: string }> = [
  { value: '', key: 'all' },
  { value: 'PENDING', key: 'pending' },
  { value: 'SUCCESS', key: 'success' },
  { value: 'FAILED', key: 'failed' },
  { value: 'REFUNDED', key: 'refunded' },
];

const STYLES: Record<PaymentStatus, string> = {
  PENDING: 'bg-[#FEF3C7] text-[#B45309]',
  SUCCESS: 'bg-[#D1FAE5] text-[#047857]',
  FAILED: 'bg-[#FEE2E2] text-[#B91C1C]',
  REFUNDED: 'bg-surface-sunken text-text-secondary',
};

export function PaymentsTable({ rows, initialStatus }: { rows: ReadonlyArray<AdminPaymentRow>; initialStatus: '' | PaymentStatus }): React.JSX.Element {
  const t = useTranslations('admin.payments');
  const router = useRouter();
  const [status, setStatus] = useState<'' | PaymentStatus>(initialStatus);

  function applyFilter(next: '' | PaymentStatus): void {
    setStatus(next);
    const params = new URLSearchParams();
    if (next) params.set('status', next);
    router.push(`/admin/payments${params.toString() ? `?${params.toString()}` : ''}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 rounded-2xl border border-border-subtle bg-surface-base p-2">
        {STATUS_KEYS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => applyFilter(opt.value)}
            className={status === opt.value ? 'rounded-full bg-text-primary px-3 py-1.5 text-xs font-semibold text-white' : 'rounded-full px-3 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-raised'}
          >
            {t(`filter.${opt.key}`)}
          </button>
        ))}
      </div>
      <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-raised text-text-tertiary">
                <Th>{t('cols.id')}</Th>
                <Th>{t('cols.restaurant')}</Th>
                <Th>{t('cols.user')}</Th>
                <Th>{t('cols.package')}</Th>
                <Th>{t('cols.amount')}</Th>
                <Th>{t('cols.status')}</Th>
                <Th>{t('cols.paidAt')}</Th>
                <Th>{t('cols.actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-text-tertiary">{t('empty')}</td></tr>
              ) : (
                rows.map((row) => <Row key={row.id} row={row} />)
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <th className="border-b border-border-subtle px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-[0.04em]">{children}</th>;
}

function Row({ row }: { row: AdminPaymentRow }): React.JSX.Element {
  const t = useTranslations('admin.payments');
  const [pending, start] = useTransition();
  const [err, setErr] = useState('');

  function refund(): void {
    if (!window.confirm('Mark this payment as refunded?')) return;
    setErr('');
    start(async () => {
      const result = await refundPaymentAction({ paymentId: row.id });
      if (!result.ok) setErr(result.message);
    });
  }

  function confirmPaid(): void {
    if (!window.confirm('Confirm this manual payment and activate its plan/theme?')) return;
    setErr('');
    start(async () => {
      const result = await confirmManualPaymentAction({ paymentId: row.id });
      if (!result.ok) setErr(result.message);
    });
  }

  const description = row.theme?.name ?? row.themePackage?.name ?? row.planKey ?? '—';

  return (
    <tr className="border-t border-border-subtle">
      <td className="px-4 py-3 font-mono text-xs text-text-tertiary">#{row.id.slice(0, 8)}</td>
      <td className="px-4 py-3 text-text-primary">
        <p className="font-semibold">{row.restaurant.name}</p>
        <p className="text-xs text-text-tertiary">/{row.restaurant.slug}</p>
      </td>
      <td className="px-4 py-3 text-text-secondary">{row.user.email}</td>
      <td className="px-4 py-3 text-text-secondary">{description}</td>
      <td className="px-4 py-3 font-mono font-bold text-text-primary">{(row.amountCents / 100).toFixed(2)} {row.currencyCode}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex h-6 items-center rounded-[4px] px-2.5 text-xs font-semibold ${STYLES[row.status]}`}>
          {row.status.toLowerCase()}
        </span>
      </td>
      <td className="px-4 py-3 text-text-tertiary">{row.paidAt ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(row.paidAt) : '—'}</td>
      <td className="px-4 py-3">
        {row.status === 'PENDING' ? (
          <button type="button" disabled={pending} onClick={confirmPaid} className="me-2 rounded-full border border-border-default px-3 py-1 text-xs font-semibold text-text-primary disabled:opacity-50">Confirm paid</button>
        ) : null}
        {row.status === 'SUCCESS' ? (
          <button type="button" disabled={pending} onClick={refund} className="rounded-full border border-border-default px-3 py-1 text-xs font-semibold text-text-primary disabled:opacity-50">{t('actions.refund')}</button>
        ) : null}
        {err ? <span className="ml-2 text-xs text-danger">{err}</span> : null}
      </td>
    </tr>
  );
}
