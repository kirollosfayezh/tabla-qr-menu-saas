import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { StatCard } from '@/components/owner/stat-card';
import { LineChart } from '@/components/owner/line-chart';
import { BarChart } from '@/components/owner/bar-chart';
import { PeriodSelector } from '@/components/owner/period-selector';
import { FulfillmentFilter } from '@/components/owner/fulfillment-filter';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { resolvePeriod } from '@/lib/period';
import { OrderRepository } from '@/repositories/order.repository';
import { OrdersTable } from './orders-table';

export const metadata = { title: 'Orders · Tabla' };

interface OrderSnapshot { lines?: ReadonlyArray<{ qty: number }> }
interface SearchParams { period?: string; type?: string }

function resolveFilter(value: string | undefined): 'DINE_IN' | 'DELIVERY' | undefined {
  return value === 'DINE_IN' || value === 'DELIVERY' ? value : undefined;
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.orders');
  const ctx = await requireOwnerRestaurant();
  const params = await searchParams;
  const period = resolvePeriod(params.period);
  const filter = resolveFilter(params.type);

  const repo = new OrderRepository();
  const [orders, daily, monthly, hourly, breakdown] = await Promise.all([
    repo.listSince(ctx.restaurantId, period.since, filter),
    period.monthly ? Promise.resolve([]) : repo.dailyStats(ctx.restaurantId, period.since),
    period.monthly ? repo.monthlyStats(ctx.restaurantId, period.since) : Promise.resolve([]),
    repo.hourlyDistribution(ctx.restaurantId, period.since),
    repo.fulfillmentBreakdown(ctx.restaurantId, period.since),
  ]);

  const dineInCount = breakdown.find((b) => b.fulfillmentType === 'DINE_IN')?.count ?? 0;
  const deliveryCount = breakdown.find((b) => b.fulfillmentType === 'DELIVERY')?.count ?? 0;

  const totalRevenue = orders.reduce((s, o) => s + o.totalCents, 0);
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;
  const itemsSold = orders.reduce((s, o) => s + ((o.items as OrderSnapshot).lines ?? []).reduce((x, l) => x + l.qty, 0), 0);

  const trendData = buildSeries(period.monthly, daily, monthly, (row) => row.count);
  const revenueData = buildSeries(period.monthly, daily, monthly, (row) => Math.round(row.revenueCents / 100));

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <PeriodSelector current={period.key} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders" value={orders.length.toLocaleString()} />
        <StatCard label="Revenue" value={formatMoney(totalRevenue, ctx)} />
        <StatCard label={t('dineInOrders')} value={dineInCount.toLocaleString()} />
        <StatCard label={t('deliveryOrders')} value={deliveryCount.toLocaleString()} />
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
        <header className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-text-primary">{t('recentTitle')}</h2>
            <p className="text-xs text-text-tertiary">{orders.length} orders in selected period</p>
          </div>
          <FulfillmentFilter current={filter ?? 'all'} />
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

type DailyRow = { day: string; count: number; revenueCents: number };
type MonthlyRow = { month: string; count: number; revenueCents: number };

/** Build a labelled chart series from either daily or monthly buckets. */
function buildSeries(
  monthlyMode: boolean,
  daily: ReadonlyArray<DailyRow>,
  monthly: ReadonlyArray<MonthlyRow>,
  value: (row: { count: number; revenueCents: number }) => number,
): Array<{ label: string; value: number }> {
  return monthlyMode
    ? monthly.map((m) => ({ label: formatMonth(m.month), value: value(m) }))
    : daily.map((d) => ({ label: formatDay(d.day), value: value(d) }));
}

function formatDay(iso: string): string { const d = new Date(iso); return `${d.getDate()}/${d.getMonth() + 1}`; }
function formatMonth(iso: string): string { const d = new Date(iso + '-01'); return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); }
function formatMoney(cents: number, ctx: { currencyCode: string; defaultLocale: 'en' | 'ar' }): string {
  return new Intl.NumberFormat(ctx.defaultLocale === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: ctx.currencyCode, maximumFractionDigits: 0 }).format(cents / 100);
}
