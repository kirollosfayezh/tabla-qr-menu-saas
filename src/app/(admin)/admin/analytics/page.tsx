import { getTranslations } from 'next-intl/server';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { requireAdmin } from '@/lib/admin/require-admin';
import { prisma } from '@/repositories/prisma.client';

export const metadata = { title: 'Analytics · Admin' };

export default async function AnalyticsPage(): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.analytics');

  const now = new Date();
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [ordersDay, ordersWeek, ordersMonth, eventsWeek, restaurantsActive] = await Promise.all([
    prisma.order.count({ where: { createdAt: { gte: dayAgo } } }),
    prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.order.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.analyticsEvent.groupBy({
      by: ['eventType'],
      _count: { _all: true },
      where: { occurredAt: { gte: weekAgo } },
    }),
    prisma.restaurant.count({ where: { status: 'ACTIVE' } }),
  ]);

  const eventMap: Record<string, number> = {};
  for (const row of eventsWeek) eventMap[row.eventType] = row._count._all;

  const topRestaurants = await prisma.restaurant.findMany({
    orderBy: { orders: { _count: 'desc' } },
    take: 10,
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('activeRestaurants')} value={String(restaurantsActive)} />
        <StatCard label={t('ordersDay')} value={String(ordersDay)} />
        <StatCard label={t('ordersWeek')} value={String(ordersWeek)} />
        <StatCard label={t('ordersMonth')} value={String(ordersMonth)} />
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-text-primary">{t('eventsWeek')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="PAGE_VIEW" value={String(eventMap.PAGE_VIEW ?? 0)} />
          <StatCard label="ITEM_VIEW" value={String(eventMap.ITEM_VIEW ?? 0)} />
          <StatCard label="ORDER_INITIATED" value={String(eventMap.ORDER_INITIATED ?? 0)} />
          <StatCard label="WHATSAPP_REDIRECT" value={String(eventMap.WHATSAPP_REDIRECT ?? 0)} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-text-primary">{t('topRestaurants')}</h2>
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-raised text-text-tertiary">
                <th className="border-b border-border-subtle px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-[0.04em]">{t('cols.restaurant')}</th>
                <th className="border-b border-border-subtle px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-[0.04em]">{t('cols.orders')}</th>
              </tr>
            </thead>
            <tbody>
              {topRestaurants.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-text-tertiary">{t('empty')}</td></tr>
              ) : (
                topRestaurants.map((r) => (
                  <tr key={r.id} className="border-t border-border-subtle">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-text-primary">{r.name}</p>
                      <p className="font-mono text-xs text-text-tertiary">/{r.slug}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-text-primary">{r._count.orders}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
