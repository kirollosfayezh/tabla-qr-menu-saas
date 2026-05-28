'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { RestaurantStatus } from '@prisma/client';
import { setRestaurantStatusAction } from '@/app/actions/admin.actions';

/** Plain-object projection sent from the server page to this client component. */
export interface RestaurantsTableRow {
  id: string;
  slug: string;
  name: string;
  status: RestaurantStatus;
  createdAt: Date;
  ordersCount: number;
  owner: { email: string; name: string | null };
}

const STATUS_OPTIONS: ReadonlyArray<{ value: '' | RestaurantStatus; key: string }> = [
  { value: '', key: 'all' },
  { value: 'ACTIVE', key: 'active' },
  { value: 'PENDING_PAYMENT', key: 'pending' },
  { value: 'SUSPENDED', key: 'suspended' },
];

interface Props {
  rows: ReadonlyArray<RestaurantsTableRow>;
  initialSearch: string;
  initialStatus: '' | RestaurantStatus;
}

export function RestaurantsTable({ rows, initialSearch, initialStatus }: Props): React.JSX.Element {
  const t = useTranslations('admin.restaurants');
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<'' | RestaurantStatus>(initialStatus);

  function applyFilters(nextSearch = search, nextStatus = status): void {
    const next = new URLSearchParams(params.toString());
    if (nextSearch) next.set('q', nextSearch); else next.delete('q');
    if (nextStatus) next.set('status', nextStatus); else next.delete('status');
    router.push(`/admin/restaurants?${next.toString()}`);
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilters();
        }}
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-border-subtle bg-surface-base p-4"
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="h-10 flex-1 min-w-[200px] rounded-lg border border-border-default bg-surface-base px-3 text-sm outline-none focus:border-brand-primary"
        />
        <select
          value={status}
          onChange={(e) => {
            const v = e.target.value as '' | RestaurantStatus;
            setStatus(v);
            applyFilters(search, v);
          }}
          className="h-10 rounded-lg border border-border-default bg-surface-base px-3 text-sm outline-none focus:border-brand-primary"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{t(`status.${opt.key}`)}</option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white">
          {t('search')}
        </button>
      </form>

      <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-raised text-text-tertiary">
                <Th>{t('cols.restaurant')}</Th>
                <Th>{t('cols.owner')}</Th>
                <Th>{t('cols.orders')}</Th>
                <Th>{t('cols.status')}</Th>
                <Th>{t('cols.created')}</Th>
                <Th>{t('cols.actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-text-tertiary">{t('empty')}</td></tr>
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

function Row({ row }: { row: RestaurantsTableRow }): React.JSX.Element {
  const t = useTranslations('admin.restaurants');
  const [pending, start] = useTransition();
  const [error, setError] = useState('');

  function setStatus(next: RestaurantStatus): void {
    setError('');
    start(async () => {
      const result = await setRestaurantStatusAction({ restaurantId: row.id, status: next });
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <tr className="border-t border-border-subtle">
      <td className="px-4 py-3">
        <p className="font-semibold text-text-primary">{row.name}</p>
        <p className="font-mono text-xs text-text-tertiary">/{row.slug}</p>
      </td>
      <td className="px-4 py-3 text-text-secondary">
        <p>{row.owner.name ?? '—'}</p>
        <p className="text-xs text-text-tertiary">{row.owner.email}</p>
      </td>
      <td className="px-4 py-3 font-mono text-text-primary">{row.ordersCount}</td>
      <td className="px-4 py-3"><StatusPill status={row.status} /></td>
      <td className="px-4 py-3 text-text-tertiary">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(row.createdAt)}</td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          {row.status !== 'SUSPENDED' ? (
            <button type="button" disabled={pending} onClick={() => setStatus('SUSPENDED')} className="rounded-full border border-border-default px-3 py-1 text-xs font-semibold text-text-primary disabled:opacity-50">{t('actions.suspend')}</button>
          ) : null}
          {row.status !== 'ACTIVE' ? (
            <button type="button" disabled={pending} onClick={() => setStatus('ACTIVE')} className="rounded-full bg-brand-primary px-3 py-1 text-xs font-semibold text-white disabled:opacity-50">{t('actions.activate')}</button>
          ) : null}
          {error ? <span className="text-xs text-danger">{error}</span> : null}
        </div>
      </td>
    </tr>
  );
}

function StatusPill({ status }: { status: RestaurantStatus }): React.JSX.Element {
  const styles: Record<RestaurantStatus, string> = {
    ACTIVE: 'bg-[#D1FAE5] text-[#047857]',
    PENDING_PAYMENT: 'bg-[#FEF3C7] text-[#B45309]',
    SUSPENDED: 'bg-[#FEE2E2] text-[#B91C1C]',
  };
  return (
    <span className={`inline-flex h-6 items-center rounded-[4px] px-2.5 text-xs font-semibold ${styles[status]}`}>
      {status.replace('_', ' ').toLowerCase()}
    </span>
  );
}
