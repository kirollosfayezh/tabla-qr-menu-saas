import { getTranslations } from 'next-intl/server';
import type { Order } from '@prisma/client';
import { mapsUrl } from '@/lib/whatsapp/message-builder';

interface OrderSnapshot { lines?: ReadonlyArray<{ qty: number }> }

function itemCount(order: Order): number {
  const snap = (order.items ?? {}) as OrderSnapshot;
  return (snap.lines ?? []).reduce((sum, line) => sum + line.qty, 0);
}

/** Recent orders, enriched with fulfillment type, customer/table, and a delivery map link. */
export async function OrdersTable({ orders, locale }: { orders: ReadonlyArray<Order>; locale: 'en' | 'ar' }): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.orders');
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-surface-raised text-text-tertiary">
            <Th>{t('time')}</Th><Th>{t('type')}</Th><Th>{t('details')}</Th><Th>{t('items')}</Th><Th>{t('total')}</Th><Th>{t('status')}</Th>
          </tr>
        </thead>
        <tbody>
          {orders.slice(0, 100).map((order) => (
            <tr key={order.id} className="border-t border-border-subtle align-top transition hover:bg-surface-raised">
              <Td className="whitespace-nowrap text-text-tertiary">{formatTime(order.createdAt, locale)}</Td>
              <Td><TypeBadge type={order.fulfillmentType} label={order.fulfillmentType === 'DELIVERY' ? t('delivery') : t('dineIn')} /></Td>
              <Td><OrderDetailsCell order={order} mapLabel={t('viewMap')} tableLabel={t('table')} /></Td>
              <Td className="whitespace-nowrap">{t('itemsCount', { count: itemCount(order) })}</Td>
              <Td className="whitespace-nowrap font-mono font-bold text-text-primary">{formatMoneyRaw(order.totalCents, order.currencyCode, locale)}</Td>
              <Td>
                <span className="inline-flex h-6 items-center rounded-[4px] bg-[#D1FAE5] px-2.5 text-xs font-semibold text-[#047857]">
                  {t('statusSent')}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TypeBadge({ type, label }: { type: 'DINE_IN' | 'DELIVERY'; label: string }): React.JSX.Element {
  const delivery = type === 'DELIVERY';
  return (
    <span
      className="inline-flex h-6 items-center whitespace-nowrap rounded-[4px] px-2.5 text-xs font-semibold"
      style={delivery
        ? { background: '#FEF3C7', color: '#B45309' }
        : { background: '#E0E7FF', color: '#4338CA' }}
    >
      {label}
    </span>
  );
}

function OrderDetailsCell({ order, mapLabel, tableLabel }: { order: Order; mapLabel: string; tableLabel: string }): React.JSX.Element {
  if (order.fulfillmentType === 'DELIVERY') {
    const map = mapsUrl(order.deliveryLat, order.deliveryLng);
    return (
      <div className="min-w-0 space-y-0.5">
        <p className="font-semibold text-text-primary">{order.customerName ?? '—'}</p>
        {order.customerPhone ? <p className="font-mono text-xs text-text-tertiary">{order.customerPhone}</p> : null}
        {order.deliveryAddress ? <p className="max-w-xs truncate text-xs text-text-secondary">{order.deliveryAddress}</p> : null}
        {map ? (
          <a href={map} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand-primary underline">
            📍 {mapLabel}
          </a>
        ) : null}
      </div>
    );
  }
  return <span className="font-mono font-semibold text-text-primary">{order.tableNumber ? `${tableLabel} ${order.tableNumber}` : '—'}</span>;
}

function formatTime(date: Date, locale: 'en' | 'ar'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
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
