import { getTranslations } from 'next-intl/server';
import { AdminPageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/admin/require-admin';
import { AuditLogRepository } from '@/repositories/admin/audit-log.repository';

export const metadata = { title: 'Audit log · Admin' };

const PAGE_SIZE = 100;

export default async function AuditLogPage(): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.audit');
  let rows: Awaited<ReturnType<AuditLogRepository['list']>> = [];
  let unavailable = false;
  try {
    rows = await new AuditLogRepository().list(PAGE_SIZE, 0);
  } catch {
    unavailable = true;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />
      {unavailable ? (
        <p className="rounded-2xl border border-dashed border-border-default bg-surface-base p-6 text-center text-sm text-text-secondary">
          {t('tableMissing')}
        </p>
      ) : (
        <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-surface-raised text-text-tertiary">
                  <Th>{t('cols.time')}</Th>
                  <Th>{t('cols.actor')}</Th>
                  <Th>{t('cols.action')}</Th>
                  <Th>{t('cols.target')}</Th>
                  <Th>{t('cols.metadata')}</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-text-tertiary">{t('empty')}</td></tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-border-subtle">
                      <td className="px-4 py-3 text-text-tertiary">{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(row.createdAt)}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.actorEmail}</td>
                      <td className="px-4 py-3 font-mono text-xs text-text-primary">{row.action}</td>
                      <td className="px-4 py-3 text-text-secondary">{row.targetType}{row.targetId ? `: ${row.targetId.slice(0, 8)}` : ''}</td>
                      <td className="px-4 py-3 font-mono text-xs text-text-tertiary">{row.metadata ? JSON.stringify(row.metadata) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <th className="border-b border-border-subtle px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-[0.04em]">{children}</th>;
}
