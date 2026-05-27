'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatPriceForLocale } from '@/themes/helpers';
import { lineCount, subtotalCents, useCartStore } from './cart-store';
import { CartDrawer } from './cart-drawer';
import type { RestaurantSnapshot } from '@/themes/theme.types';

interface Props {
  restaurant: RestaurantSnapshot;
  locale: 'en' | 'ar';
}

export function CartBar({ restaurant, locale }: Props): React.JSX.Element | null {
  const t = useTranslations('tenant.cart');
  const [open, setOpen] = useState(false);
  const lines = useCartStore(restaurant.id, (state) => state.lines);
  const count = lineCount(lines);
  if (count === 0) return null;
  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-sm font-bold text-white shadow-2xl"
          style={{ backgroundColor: 'var(--d-primary)' }}
        >
          <span className="inline-flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs">{count}</span>
            {t('view')}
          </span>
          <span>{formatPriceForLocale(subtotalCents(lines), restaurant.currencyCode, locale)}</span>
        </button>
      </div>
      <div className="fixed bottom-6 end-6 z-50 hidden sm:block">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-xl"
          style={{ backgroundColor: 'var(--d-primary)' }}
        >
          {t('view')} ({count})
        </button>
      </div>
      <CartDrawer restaurant={restaurant} locale={locale} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
