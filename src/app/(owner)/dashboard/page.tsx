import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { StatCard } from '@/components/owner/stat-card';
import { BarChart } from '@/components/owner/bar-chart';
import { TopItemsList } from '@/components/owner/top-items-list';
import { LiveBanner } from '@/components/owner/live-banner';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { AnalyticsEventRepository } from '@/repositories/analytics-event.repository';
import { OrderRepository } from '@/repositories/order.repository';
import { prisma } from '@/repositories/prisma.client';
import { env } from '@/config/env';

export const metadata = { title: 'Dashboard · Tabla' };

interface DailyBucket {
  label: string;
  value: number;
}

export default async function DashboardHomePage(): Promise<React.JSX.Element> {
  const ctx = await requireOwnerRestaurant();
  const t = await getTranslations('owner.dashboard');
  const restaurant = await new RestaurantRepository().findByOwnerId(ctx.userId);
  if (!restaurant) throw new Error('Restaurant missing');

  const today = startOfDay(new Date());
  const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const events = new AnalyticsEventRepository();
  const orders = new OrderRepository();

  const [viewsToday, ordersToday, weekOrders, monthOrderRows, topItemViews] = await Promise.all([
    countTodayViews(ctx.restaurantId, today),
    countTodayOrders(ctx.restaurantId, today),
    weeklyOrders(ctx.restaurantId, weekAgo),
    orders.listByRestaurant(ctx.restaurantId, 200),
    events.topItems(ctx.restaurantId, monthAgo, 5),
  ]);

  const ordersLast30 = monthOrderRows.filter((o) => o.createdAt >= monthAgo);
  const avgOrder = ordersLast30.length > 0
    ? ordersLast30.reduce((sum, o) => sum + o.totalCents, 0) / ordersLast30.length
    : 0;

  const itemMap = await loadItemNames(ctx.restaurantId, topItemViews.map((row) => row.itemId));
  const topItems = topItemViews.map((row) => ({
    name: itemMap.get(row.itemId) ?? row.itemId.slice(0, 8),
    count: row.count,
  }));

  const menuUrl = `${env.APP_PUBLIC_URL.replace(/\/$/, '')}/${restaurant.slug}`;
  const isLive = restaurant.status === 'ACTIVE' && restaurant.publishedAt !== null;

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />

      <LiveBanner
        menuUrl={menuUrl}
        active={isLive}
        title={isLive ? t('liveTitle') : t('notLiveTitle')}
        liveLabel={isLive ? t('liveBadge') : t('pendingBadge')}
        liveAtLabel={isLive ? t('liveAt') : t('publishHint')}
        downloadQr={t('downloadQr')}
        preview={t('previewMenu')}
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('viewsToday')} value={String(viewsToday)} hint={t('window24h')} />
        <StatCard label={t('ordersToday')} value={String(ordersToday)} hint={t('window24h')} />
        <StatCard label={t('avgOrder')} value={formatMoney(avgOrder, restaurant.currencyCode, ctx.defaultLocale)} hint={t('window30d')} />
        <StatCard label={t('ordersTotal30d')} value={String(ordersLast30.length)} hint={t('window30d')} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
          <header className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-text-primary">{t('ordersChartTitle')}</h2>
              <p className="text-xs text-text-tertiary">{t('ordersChartHint')}</p>
            </div>
          </header>
          <BarChart data={weekOrders} />
        </article>
        <article className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
          <header className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-text-primary">{t('topItemsTitle')}</h2>
              <p className="text-xs text-text-tertiary">{t('topItemsHint')}</p>
            </div>
          </header>
          <TopItemsList items={topItems} />
        </article>
      </section>
    </div>
  );
}

function startOfDay(date: Date): Date {
  const out = new Date(date);
  out.setHours(0, 0, 0, 0);
  return out;
}

async function countTodayViews(restaurantId: string, since: Date): Promise<number> {
  return prisma.analyticsEvent.count({
    where: { restaurantId, eventType: 'PAGE_VIEW', occurredAt: { gte: since } },
  });
}

async function countTodayOrders(restaurantId: string, since: Date): Promise<number> {
  return prisma.order.count({ where: { restaurantId, createdAt: { gte: since } } });
}

async function weeklyOrders(restaurantId: string, since: Date): Promise<DailyBucket[]> {
  const rows = await prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
    SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::bigint AS count
    FROM orders
    WHERE restaurant_id = ${restaurantId}::uuid AND created_at >= ${since}
    GROUP BY day
  `;
  const map = new Map(rows.map((r) => [r.day, Number(r.count)]));
  const days: DailyBucket[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ label: dayLabel(d), value: map.get(key) ?? 0 });
  }
  return days;
}

function dayLabel(date: Date): string {
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()] ?? '';
}

async function loadItemNames(restaurantId: string, itemIds: ReadonlyArray<string>): Promise<Map<string, string>> {
  if (itemIds.length === 0) return new Map();
  const items = await prisma.menuItem.findMany({
    where: { id: { in: [...itemIds] }, restaurantId },
    select: { id: true, name: true },
  });
  return new Map(items.map((it) => [it.id, it.name]));
}

function formatMoney(cents: number, currency: string, locale: 'en' | 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { style: 'currency', currency }).format(cents / 100);
}
