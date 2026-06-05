'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ElegantHeader } from './elegant-header';
import { ElegantTabs } from './elegant-tabs';
import { ElegantItemCard } from './elegant-item-card';
import { ElegantItemModal } from './elegant-item-modal';
import { PageViewBeacon } from '../classic/page-view-beacon';
import { CartBar } from '@/app/t/[slug]/cart/cart-bar';
import { PromoTicker } from '../shared/promo-ticker';
import { emitAnalyticsEvent } from '@/lib/analytics/emit';
import { localizedField } from '../helpers';
import type { MenuItemSnapshot, ThemeProps } from '../theme.types';

/**
 * Elegant theme — dark surface, gold accents, italic serif typography,
 * 2-column item grid. Matches `qrcode menu/diner.jsx` Elegant* components.
 */
export function ElegantPage({ restaurant, categories, locale }: ThemeProps): React.JSX.Element {
  const t = useTranslations('tenant');
  const [opened, setOpened] = useState<MenuItemSnapshot | null>(null);

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-diner-theme="elegant"
      className="min-h-screen bg-[var(--d-bg)] pb-28 text-[var(--d-text)]"
    >
      <PageViewBeacon restaurantId={restaurant.id} />
      <ElegantHeader restaurant={restaurant} locale={locale} />
      <PromoTicker messages={restaurant.promoMessages} />
      {categories.length > 0 ? <ElegantTabs categories={categories} locale={locale} /> : null}

      <main className="mx-auto w-full max-w-3xl px-5 pt-4 @5xl:max-w-6xl">
        {categories.length === 0 ? (
          <p className="rounded-none border border-[var(--d-border)] bg-[var(--d-surface)] p-8 text-center font-serif italic text-[var(--d-text-soft)]">
            {t('menuComingSoon')}
          </p>
        ) : (
          categories.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-24 pt-6">
              <h2 className="mb-4 font-serif text-2xl font-normal italic tracking-wide text-[var(--d-primary)]">
                {localizedField(cat.name, cat.nameAr, locale)}
              </h2>
              <div className="grid grid-cols-2 gap-3.5 @2xl:grid-cols-3 @5xl:grid-cols-4">
                {cat.items.map((item) => (
                  <ElegantItemCard
                    key={item.id}
                    item={item}
                    restaurantId={restaurant.id}
                    currencyCode={restaurant.currencyCode}
                    locale={locale}
                    onOpen={() => {
                      emitAnalyticsEvent({ restaurantId: restaurant.id, eventType: 'ITEM_VIEW', metadata: { itemId: item.id } });
                      setOpened(item);
                    }}
                  />
                ))}
              </div>
            </section>
          ))
        )}
        <footer className="pt-12 text-center font-serif text-xs italic tracking-widest text-[var(--d-text-soft)]">{t('poweredBy')}</footer>
      </main>

      {opened ? (
        <ElegantItemModal
          item={opened}
          restaurantId={restaurant.id}
          currencyCode={restaurant.currencyCode}
          locale={locale}
          onClose={() => setOpened(null)}
        />
      ) : null}
      <CartBar restaurant={restaurant} locale={locale} />
    </div>
  );
}
