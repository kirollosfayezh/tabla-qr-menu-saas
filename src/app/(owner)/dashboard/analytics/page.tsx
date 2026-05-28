import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { StatCard } from '@/components/owner/stat-card';
import { BarChart } from '@/components/owner/bar-chart';
import { LineChart } from '@/components/owner/line-chart';
import { DonutChart } from '@/components/owner/donut-chart';
import { PeriodSelector } from '@/components/owner/period-selector';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { resolvePeriod } from '@/lib/period';
import { AnalyticsEventRepository } from '@/repositories/analytics-event.repository';
import { OrderRepository } from '@/repositories/order.repository';
import { prisma } from '@/repositories/prisma.client';

export const metadata = { title: 'Analytics · Tabla' };

interface SearchParams { period?: string }

export default async function OwnerAnalyticsPage({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<React.JSX.Element> {
  const ctx = await requireOwnerRestaurant();
  const t = await getTranslations('owner.analytics');
  const params = await searchParams;
  const period = resolvePeriod(params.period);

  const events = new AnalyticsEventRepository();
  const orders = new OrderRepository();

  const [byType, topItems, daily, monthly, hourly, orderRows] = await Promise.all([
    events.countByType(ctx.restaurantId, period.since),
    events.topItems(ctx.restaurantId, period.since, 10),
    period.monthly ? Promise.resolve([]) : events.dailyPageViews(ctx.restaurantId, period.since),
    period.monthly ? events.monthlyPageViews(ctx.restaurantId, period.since) : Promise.resolve([]),
    events.hourlyDistribution(ctx.restaurantId, period.since),
    orders.listSince(ctx.restaurantId, period.since),
  ]);

  const counts: Record<string, number> = {};
  for (const r of byType) counts[r.eventType] = r.count;
  const pageViews = counts.PAGE_VIEW ?? 0;
  const itemViews = counts.ITEM_VIEW ?? 0;
  const orderInits = counts.ORDER_INITIATED ?? 0;
  const waRedirects = counts.WHATSAPP_REDIRECT ?? 0;
  const conversion = pageViews > 0 ? ((waRedirects / pageViews) * 100).toFixed(1) : '0.0';

  const itemMap = topItems.length > 0
    ? new Map((await prisma.menuItem.findMany({
        where: { id: { in: topItems.map((r) => r.itemId) }, restaurantId: ctx.restaurantId },
        select: { id: true, name: true },
      })).map((it) => [it.id, it.name]))
    : new Map<string, string>();

  const totalRevenue = orderRows.reduce((sum, o) => sum + o.totalCents, 0);
  const avgOrder = orderRows.length > 0 ? totalRevenue / orderRows.length : 0;

  const trendData = period.monthly
    ? monthly.map((m) => ({ label: formatMonth(m.month), value: m.count }))
    : daily.map((d) => ({ label: formatDay(d.day), value: d.count }));

  const peakBuckets = [
    { label: 'Morning', range: [6, 11] as const, color: '#FF6B35' },
    { label: 'Lunch',   range: [11, 15] as const, color: '#2563EB' },
    { label: 'Afternoon', range: [15, 18] as const, color: '#10B981' },
    { label: 'Evening', range: [18, 23] as const, color: '#7C3AED' },
  ];
  const hourSlices = peakBuckets.map((b) => ({
    label: b.label,
    value: hourly.filter((h) => h.hour >= b.range[0] && h.hour < b.range[1]).reduce((s, h) => s + h.count, 0),
    color: b.color,
  }));
  const totalHourViews = hourSlices.reduce((s, x) => s + x.value, 0);
  const topBucket = hourSlices.reduce((max, x) => x.value > max.value ? x : max, hourSlices[0]!);

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description', { days: 30 })} />
      <PeriodSelector current={period.key} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('pageViews')} value={pageViews.toLocaleString()} />
        <StatCard label={t('itemViews')} value={itemViews.toLocaleString()} />
        <StatCard label={t('orderInits')} value={orderInits.toLocaleString()} />
        <StatCard label={t('waRedirects')} value={waRedirects.toLocaleString()} hint={t('conversion', { pct: conversion })} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Confirmed orders" value={orderRows.length.toLocaleString()} />
        <StatCard label="Revenue" value={formatMoney(totalRevenue, ctx)} />
        <StatCard label="Avg order" value={formatMoney(avgOrder, ctx)} />
        <StatCard label="Peak time" value={topBucket.label} hint={`${topBucket.value} views`} />
      </section>

      <section className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-bold text-text-primary">
          {period.monthly ? 'Page views — monthly' : 'Page views — daily'}
        </h2>
        {trendData.length === 0
          ? <p className="py-8 text-center text-sm text-text-tertiary">{t('empty')}</p>
          : <LineChart data={trendData} height={220} />}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-bold text-text-primary">Hourly traffic (24h)</h2>
          <BarChart
            data={hourly.map((h) => ({ label: h.hour % 3 === 0 ? `${h.hour}h` : '', value: h.count }))}
            height={180}
          />
        </div>
        <div className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg font-bold text-text-primary">Peak time breakdown</h2>
          {totalHourViews === 0
            ? <p className="py-8 text-center text-sm text-text-tertiary">{t('empty')}</p>
            : <DonutChart slices={hourSlices} centerValue={String(totalHourViews)} centerLabel="views" />}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-text-primary">{t('topItems')}</h2>
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-surface-raised text-text-tertiary">
                <Th>{t('cols.item')}</Th>
                <Th>{t('cols.views')}</Th>
              </tr>
            </thead>
            <tbody>
              {topItems.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-8 text-center text-text-tertiary">{t('empty')}</td></tr>
              ) : (
                topItems.map((row) => (
                  <tr key={row.itemId} className="border-t border-border-subtle">
                    <td className="px-4 py-3 text-text-primary">{itemMap.get(row.itemId) ?? row.itemId.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-mono text-text-primary">{row.count}</td>
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

function formatDay(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}
function formatMonth(iso: string): string {
  const d = new Date(iso + '-01');
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}
function formatMoney(cents: number, ctx: { currencyCode: string; defaultLocale: 'en' | 'ar' }): string {
  return new Intl.NumberFormat(ctx.defaultLocale === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency: ctx.currencyCode, maximumFractionDigits: 0 }).format(cents / 100);
}
function Th({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <th className="border-b border-border-subtle px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-[0.04em]">{children}</th>;
}
