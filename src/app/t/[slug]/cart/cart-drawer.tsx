'use client';

/* eslint-disable max-lines */

import { useEffect, useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { placeOrderAction } from '@/app/actions/order.actions';
import { formatPriceForLocale } from '@/themes/helpers';
import { CartLineRow } from './cart-line-row';
import { useCartStore } from './cart-store';
import { useCartTotals } from './use-cart-totals';
import { lineKey } from './types';
import { CloseIcon, WhatsappIcon } from '@/themes/classic/icons';
import { emitAnalyticsEvent } from '@/lib/analytics/emit';
import { cn } from '@/lib/cn';
import type { CartState } from './types';
import type { RestaurantSnapshot } from '@/themes/theme.types';

interface Props {
  restaurant: RestaurantSnapshot;
  locale: 'en' | 'ar';
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ restaurant, locale, open, onClose }: Props): React.JSX.Element | null {
  const t = useTranslations('tenant.cart');
  const target = typeof document === 'undefined' ? null : document.body;
  const [error, setError] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'DINE_IN' | 'DELIVERY'>('DINE_IN');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const cart = useCartStore(restaurant.id, (state) => state);
  const totals = useCartTotals(cart.lines, restaurant.taxPercent, restaurant.serviceChargePercent);

  useEffect(() => {
    function onKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!target || !open) return null;
  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 sm:items-stretch sm:justify-end">
      <button type="button" aria-label={t('back')} onClick={onClose} className="absolute inset-0" />
      <section className="relative z-[71] flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-[28px] bg-[var(--d-surface)] text-[var(--d-text)] shadow-2xl sm:h-full sm:max-h-none sm:rounded-none sm:border-s sm:border-[var(--d-border)]">
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[var(--d-border)]" />
        <header className="flex items-center justify-between p-5 pb-2">
          <h2 className="font-serif text-2xl font-semibold text-[var(--d-text)]">{t('view')}</h2>
          <button type="button" aria-label={t('back')} onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--d-secondary)] text-[var(--d-primary)]"><CloseIcon size={16} /></button>
        </header>
        <div className="overflow-y-auto px-5">
          {cart.lines.length === 0 ? <p className="py-10 text-center text-sm">{t('empty')}</p> : null}
          {cart.lines.map((line) => {
            const key = lineKey(line);
            return (
              <CartLineRow
                key={key}
                line={line}
                currencyCode={restaurant.currencyCode}
                locale={locale}
                onQty={(qty) => cart.setQty(key, qty)}
                onNotes={(notes) => cart.setNotes(key, notes)}
              />
            );
          })}
        </div>
        <footer className="space-y-4 border-t border-[var(--d-border)] p-5">
          <OrderDetails
            fulfillmentType={fulfillmentType}
            setFulfillmentType={(value) => { setFulfillmentType(value); if (value === 'DINE_IN') setCoords(null); }}
            tableNumber={cart.tableNumber}
            setTableNumber={cart.setTableNumber}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            deliveryAddress={deliveryAddress}
            setDeliveryAddress={setDeliveryAddress}
            coords={coords}
            setCoords={setCoords}
          />
          <Totals totals={totals} currencyCode={restaurant.currencyCode} locale={locale} />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="button"
            disabled={pending || cart.lines.length === 0}
            onClick={() => submitOrder({ restaurant, locale, cart, fulfillmentType, customerName, customerPhone, deliveryAddress, coords, setError, startTransition })}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl px-4 py-4 text-sm font-bold text-white shadow-lg disabled:opacity-50"
            style={{ backgroundColor: pending || cart.lines.length === 0 ? '#9ca3af' : '#25D366' }}
          >
            <WhatsappIcon size={20} />
            {pending ? t('sending') : t('send')}
          </button>
        </footer>
      </section>
    </div>,
    target,
  );
}

interface OrderDetailsProps {
  fulfillmentType: 'DINE_IN' | 'DELIVERY';
  setFulfillmentType: (value: 'DINE_IN' | 'DELIVERY') => void;
  tableNumber: string;
  setTableNumber: (value: string) => void;
  customerName: string;
  setCustomerName: (value: string) => void;
  customerPhone: string;
  setCustomerPhone: (value: string) => void;
  deliveryAddress: string;
  setDeliveryAddress: (value: string) => void;
  coords: { lat: number; lng: number } | null;
  setCoords: (value: { lat: number; lng: number } | null) => void;
}

function OrderDetails(props: OrderDetailsProps): React.JSX.Element {
  const { fulfillmentType, setFulfillmentType, tableNumber, setTableNumber } = props;
  const t = useTranslations('tenant.cart');
  return (
    <div className="rounded-2xl bg-[var(--d-primary-soft)] p-4">
      <div className="grid grid-cols-2 gap-2">
        {(['DINE_IN', 'DELIVERY'] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setFulfillmentType(type)}
            className={cn(
              'rounded-xl px-3 py-2 text-sm font-bold transition',
              fulfillmentType === type
                ? 'bg-[var(--d-primary)] text-[var(--d-on-primary)]'
                : 'bg-[var(--d-surface)] text-[var(--d-text)]',
            )}
          >
            {type === 'DINE_IN' ? t('dineIn') : t('delivery')}
          </button>
        ))}
      </div>
      {fulfillmentType === 'DINE_IN' ? (
        <label className="mt-3 block">
          <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--d-primary)]">{t('tableNumber')}</span>
          <input value={tableNumber} onChange={(event) => setTableNumber(event.target.value)} placeholder={t('tableNumber')} className="w-full rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] px-3 py-3 text-sm font-semibold outline-none focus:border-[var(--d-primary)]" maxLength={20} />
        </label>
      ) : (
        <DeliveryFields {...props} />
      )}
    </div>
  );
}

function DeliveryFields({
  customerName, setCustomerName, customerPhone, setCustomerPhone,
  deliveryAddress, setDeliveryAddress, coords, setCoords,
}: OrderDetailsProps): React.JSX.Element {
  const t = useTranslations('tenant.cart');
  const inputClass = 'w-full rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] px-3 py-3 text-sm font-semibold outline-none focus:border-[var(--d-primary)]';
  return (
    <div className="mt-3 grid gap-3">
      <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder={t('customerName')} className={inputClass} maxLength={80} />
      <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder={t('customerPhone')} className={inputClass} maxLength={30} />
      <textarea value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} placeholder={t('deliveryAddress')} className={`min-h-20 resize-none ${inputClass}`} maxLength={240} />
      <LocationPicker coords={coords} setCoords={setCoords} />
    </div>
  );
}

function LocationPicker({ coords, setCoords }: Pick<OrderDetailsProps, 'coords' | 'setCoords'>): React.JSX.Element {
  const t = useTranslations('tenant.cart');
  const [status, setStatus] = useState<'idle' | 'locating' | 'error'>('idle');

  function locate(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setStatus('error'); return; }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setStatus('idle'); },
      () => setStatus('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={locate}
        disabled={status === 'locating'}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold transition disabled:opacity-60',
          coords ? 'border-[var(--d-primary)] text-[var(--d-primary)]' : 'border-[var(--d-border)] text-[var(--d-text)]',
        )}
      >
        <span aria-hidden>📍</span>
        {status === 'locating' ? t('locating') : coords ? t('locationSet') : t('useLocation')}
      </button>
      {coords ? (
        <a
          href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs font-semibold text-[var(--d-primary)] underline"
        >
          {t('viewLocation')}
        </a>
      ) : null}
      {status === 'error' ? <p className="text-center text-xs font-semibold text-red-600">{t('locationError')}</p> : null}
    </div>
  );
}

function Totals({ totals, currencyCode, locale }: {
  totals: ReturnType<typeof useCartTotals>;
  currencyCode: string;
  locale: 'en' | 'ar';
}): React.JSX.Element {
  const t = useTranslations('tenant.cart');
  const rows = [['subtotal', totals.subtotalCents], ['tax', totals.taxCents], ['service', totals.serviceCents], ['total', totals.totalCents]] as const;
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([key, value]) => (
        <div key={key} className={key === 'total' ? 'flex justify-between gap-3 border-t border-[var(--d-border)] pt-3 text-base font-bold' : 'flex justify-between gap-3 text-[var(--d-text-soft)]'}>
          <dt>{t(key)}</dt>
          <dd className="font-semibold text-[var(--d-text)]">{formatPriceForLocale(value, currencyCode, locale)}</dd>
        </div>
      ))}
    </dl>
  );
}

interface SubmitArgs {
  restaurant: RestaurantSnapshot;
  locale: 'en' | 'ar';
  cart: CartState;
  fulfillmentType: 'DINE_IN' | 'DELIVERY';
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  coords: { lat: number; lng: number } | null;
  setError: (value: string) => void;
}

function submitOrder(args: SubmitArgs & { startTransition: (callback: () => void) => void }): void {
  args.startTransition(() => {
    void submitOrderAsync(args);
  });
}

async function submitOrderAsync(args: SubmitArgs): Promise<void> {
  args.setError('');
  const result = await placeOrderAction(args.restaurant.slug, {
    restaurantId: args.restaurant.id,
    locale: args.locale,
    fulfillmentType: args.fulfillmentType,
    tableNumber: args.cart.tableNumber,
    customerName: args.customerName,
    customerPhone: args.customerPhone,
    deliveryAddress: args.deliveryAddress,
    deliveryLat: args.coords?.lat,
    deliveryLng: args.coords?.lng,
    lines: args.cart.lines.map((line) => ({
      itemId: line.itemId,
      qty: line.qty,
      notes: line.notes,
      optionIds: (line.selections ?? []).map((s) => s.optionId),
    })),
    deviceInfo: navigator.userAgent,
  });
  if (!result.ok) {
    args.setError(result.message);
    return;
  }
  args.cart.clear();
  const opened = window.open(result.value.url, '_blank', 'noopener,noreferrer');
  if (opened) {
    emitAnalyticsEvent({
      restaurantId: args.restaurant.id,
      eventType: 'WHATSAPP_REDIRECT',
      metadata: { orderId: result.value.orderId, fallback: result.value.fallback },
    });
  }
}
