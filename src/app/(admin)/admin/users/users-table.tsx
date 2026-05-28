'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { UserRole } from '@prisma/client';
import type { AdminUserRow } from '@/repositories/admin/admin-user.repository';
import { setUserRoleAction } from '@/app/actions/admin.actions';

interface Props {
  rows: ReadonlyArray<AdminUserRow>;
  initialSearch: string;
  initialRole: '' | UserRole;
  currentUserId: string;
}

export function UsersTable({ rows, initialSearch, initialRole, currentUserId }: Props): React.JSX.Element {
  const t = useTranslations('admin.users');
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(initialSearch);
  const [role, setRole] = useState<'' | UserRole>(initialRole);

  function apply(nextSearch = search, nextRole = role): void {
    const next = new URLSearchParams(params.toString());
    if (nextSearch) next.set('q', nextSearch); else next.delete('q');
    if (nextRole) next.set('role', nextRole); else next.delete('role');
    router.push(`/admin/users?${next.toString()}`);
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
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
          value={role}
          onChange={(e) => {
            const v = e.target.value as '' | UserRole;
            setRole(v);
            apply(search, v);
          }}
          className="h-10 rounded-lg border border-border-default bg-surface-base px-3 text-sm"
        >
          <option value="">{t('roleAny')}</option>
          <option value="OWNER">{t('roleOwner')}</option>
          <option value="ADMIN">{t('roleAdmin')}</option>
        </select>
        <button type="submit" className="h-10 rounded-full bg-brand-primary px-5 text-sm font-semibold text-white">{t('search')}</button>
      </form>

      <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-raised text-text-tertiary">
                <Th>{t('cols.user')}</Th>
                <Th>{t('cols.role')}</Th>
                <Th>{t('cols.restaurants')}</Th>
                <Th>{t('cols.created')}</Th>
                <Th>{t('cols.actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-text-tertiary">{t('empty')}</td></tr>
              ) : (
                rows.map((row) => <Row key={row.id} row={row} isSelf={row.id === currentUserId} />)
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

function Row({ row, isSelf }: { row: AdminUserRow; isSelf: boolean }): React.JSX.Element {
  const t = useTranslations('admin.users');
  const [pending, start] = useTransition();
  const [err, setErr] = useState('');

  function setRole(role: UserRole): void {
    setErr('');
    start(async () => {
      const result = await setUserRoleAction({ userId: row.id, role });
      if (!result.ok) setErr(result.message);
    });
  }

  return (
    <tr className="border-t border-border-subtle">
      <td className="px-4 py-3">
        <p className="font-semibold text-text-primary">{row.name ?? '—'}</p>
        <p className="text-xs text-text-tertiary">{row.email}</p>
      </td>
      <td className="px-4 py-3">
        <span className={row.role === 'ADMIN' ? 'inline-flex h-6 items-center rounded-[4px] bg-brand-primary-soft px-2.5 text-xs font-semibold text-brand-primary-dark' : 'inline-flex h-6 items-center rounded-[4px] bg-surface-sunken px-2.5 text-xs font-semibold text-text-secondary'}>
          {row.role}
        </span>
      </td>
      <td className="px-4 py-3 text-text-secondary">{row._count.restaurants}</td>
      <td className="px-4 py-3 text-text-tertiary">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(row.createdAt)}</td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className="text-xs text-text-tertiary">{t('self')}</span>
        ) : row.role === 'OWNER' ? (
          <button type="button" disabled={pending} onClick={() => setRole('ADMIN')} className="rounded-full border border-border-default px-3 py-1 text-xs font-semibold text-text-primary disabled:opacity-50">{t('actions.promote')}</button>
        ) : (
          <button type="button" disabled={pending} onClick={() => setRole('OWNER')} className="rounded-full border border-border-default px-3 py-1 text-xs font-semibold text-text-primary disabled:opacity-50">{t('actions.demote')}</button>
        )}
        {err ? <span className="ml-2 text-xs text-danger">{err}</span> : null}
      </td>
    </tr>
  );
}
