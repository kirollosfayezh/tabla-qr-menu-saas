import { getTranslations } from 'next-intl/server';
import type { Order } from '@prisma/client';
import { PageHeader } from '@/components/owner/page-header';
import { StatCard } from '@/components/owner/stat-card';
import { LineChart } from '@/components/owner/line-chart';
import { BarChart } from '@/components/owner/bar-chart';
import { PeriodSelector } from '@/components/owner/period-selector';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { resolvePeriod } from '@/lib/period';
import { OrderRepository } from '@/repositories/order.repository';

export const metadata = { title: 'Orders · Tabla' };

interface OrderSnapshot { lines?: ReadonlyArray<{ qty: number }> }
interface SearchParams { period?: string }

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.orders');
  const ctx = await requireOwnerRestaurant();
  const params = await searchParams;
  const period = resolvePeriod(params.period);

  const repo = new OrderRepository();
  const [orders, daily, monthly, hourly] = await Promise.all([
    repo.listSince(ctx.restaurantId, period.since),
    period.monthly ? Promise.resolve([]) : repo.dailyStats(ctx.restaurantId, period.since),
    period.monthly ? repo.monthlyStats(ctx.restaurantId, period.since) : Promise.resolve([]),
    repo.hourlyDistribution(ctx.restaurantId, period.since),
  ]);

  const totalRevenue = orders.reduce((s, o) => s + o.totalCents, 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
  const itemsSold = orders.reduce((s, o) => s + ((o.items as OrderSnapshot).lines ?? []).reduce((x, l) => x + l.qty, 0), 0);

  const trendData = period.monthly
    ? monthly.map((m) => ({ label: formatMonth(m.month), value: m.count }))
    : daily.map((d) => ({ label: formatDay(d.day), value: d.count }));

  const revenueData = period.monthly
    ? monthly.map((m) => ({ label: formatMonth(m.month), value: Math.round(m.revenueCents / 100) }))
    : daily.map((d) => ({ label: formatDay(d.day), value: Math.round(d.revenueCents / 100) }));

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <PeriodSelector current={period.key} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders" value={orders.length.toLocaleString()} />
        <StatCard label="Revenue" value={formatMoney(totalRevenue, ctx)} />
        <StatCard label="Avg order" value={formatMoney(avgOrder, ctx)} />
        <StatCard label="Items sold" value={itemsSold.toLocaleString()} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-bold text-text-primary">Orders trend</h2>
          {trendData.length === 0
            ? <p className="py-8 text-center text-sm text-text-tertiary">{t('empty')}</p>
            : <LineChart data={trendData} height={200} />}
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-bold text-text-primary">Revenue trend ({ctx.currencyCode})</h2>
          {revenueData.length === 0
            ? <p className="py-8 text-center text-sm text-text-tertiary">{t('empty')}</p>
            : <LineChart data={revenueData} height={200} color="#10B981" fillColor="rgba(16,185,129,0.2)" />}
        </div>
      </section>

      <section className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-bold text-text-primary">Orders by hour</h2>
        <BarChart
          data={hourly.map((h) => ({ label: h.hour % 3 === 0 ? `${h.hour}h` : '', value: h.count }))}
          height={160}
        />
      </section>

      <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
        <header className="flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-text-primary">{t('recentTitle')}</h2>
            <p className="text-xs text-text-tertiary">{orders.length} orders in selected period</p>
          </div>
        </header>
        {orders.length === 0 ? (
          <p className="border-t border-border-subtle px-5 py-10 text-center text-sm text-text-secondary">{t('empty')}</p>
        ) : (
          <OrdersTable orders={orders} locale={ctx.defaultLocale} />
        )}
      </section>
    </div>
  );
}

async function OrdersTable({ orders, locale }: { orders: ReadonlyArray<Order>; locale: 'en' | 'ar' }): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.orders');
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-raised text-text-tertiary">
            <Th>{t('time')}</Th><Th>{t('table')}</Th><Th>{t('items')}</Th><Th>{t('total')}</Th><Th>{t('status')}</Th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 100).map((order) => {
            const snap = (order.items ?? {}) as OrderSnapshot;
            const itemCount = (snap.lines ?? []).reduce((s, l) => s + l.qty, 0);
            return (
              <tr key={order.id} className="border-t border-border-subtle transition hover:bg-surface-raised">
                <Td className="text-text-tertiary">{formatTime(order.createdAt, locale)}</Td>
                <Td className="font-mono font-semibold text-text-primary">{order.tableNumber ?? '—'}</Td>
                <Td>{t('itemsCount', { count: itemCount })}</Td>
                <Td className="font-mono font-bold text-text-primary">{formatMoneyRaw(order.totalCents, order.currencyCode, locale)}</Td>
                <Td>
                  <span className="inline-flex h-6 items-center rounded-[4px] bg-[#D1FAE5] px-2.5 text-xs font-semibold text-[#047857]">
                    {t('statusSent')}
                  </span>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function formatDay(iso: string): string { const d = new Date(iso); return `${d.getDate()}/${d.getMonth() + 1}`; }
function formatMonth(iso: string): string { const d = new Date(iso + '-01'); return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); }
function formatTime(d: Date, locale: 'en' | 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}
function formatMoney(cents: number, ctx: { currencyCode: string; defaultLocale: 'en' | 'ar' }): string {
  return formatMoneyRaw(cents, ctx.currencyCode, ctx.defaultLocale);
}
function formatMoneyRaw(cents: number, currency: string, locale: 'en' | 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100);
}
function Th({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <th className="border-b border-border-subtle px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-[0.04em]">{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
