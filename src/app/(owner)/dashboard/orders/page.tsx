import { getTranslations } from 'next-intl/server';
import type { Order } from '@prisma/client';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { OrderRepository } from '@/repositories/order.repository';

export const metadata = { title: 'Orders · Tabla' };

const RECENT_ORDER_LIMIT = 50;

interface OrderSnapshot {
  lines?: ReadonlyArray<{ qty: number }>;
}

export default async function OrdersPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.orders');
  const ctx = await requireOwnerRestaurant();
  const orders = await new OrderRepository().listByRestaurant(ctx.restaurantId, RECENT_ORDER_LIMIT);

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      <section className="overflow-hidden rounded-xl border border-border-subtle bg-surface-base">
        <header className="flex items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="font-display text-base font-bold text-text-primary">{t('recentTitle')}</h2>
            <p className="text-xs text-text-tertiary">{t('recentSubtitle')}</p>
          </div>
        </header>

        {orders.length === 0 ? (
          <p className="border-t border-border-subtle px-5 py-10 text-center text-sm text-text-secondary">
            {t('empty')}
          </p>
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
            <Th>{t('time')}</Th>
            <Th>{t('table')}</Th>
            <Th>{t('items')}</Th>
            <Th>{t('total')}</Th>
            <Th>{t('status')}</Th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const snapshot = (order.items ?? {}) as OrderSnapshot;
            const itemCount = (snapshot.lines ?? []).reduce((sum, line) => sum + line.qty, 0);
            return (
              <tr key={order.id} className="border-t border-border-subtle transition hover:bg-surface-raised">
                <Td className="text-text-tertiary">{formatTime(order.createdAt, locale)}</Td>
                <Td className="font-mono font-semibold text-text-primary">
                  {order.tableNumber ?? '—'}
                </Td>
                <Td>{t('itemsCount', { count: itemCount })}</Td>
                <Td className="font-mono font-bold text-text-primary">
                  {formatMoney(order.totalCents, order.currencyCode, locale)}
                </Td>
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

function Th({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <th className="border-b border-border-subtle px-4 py-2.5 text-start text-xs font-semibold uppercase tracking-[0.04em]">
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }): React.JSX.Element {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function formatTime(date: Date, locale: 'en' | 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatMoney(cents: number, currency: string, locale: 'en' | 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}
