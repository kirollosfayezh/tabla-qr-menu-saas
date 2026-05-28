'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ModernHeader } from './modern-header';
import { ModernTabs } from './modern-tabs';
import { ModernItemCard } from './modern-item-card';
import { ModernItemModal } from './modern-item-modal';
import { PageViewBeacon } from '../classic/page-view-beacon';
import { CartBar } from '@/app/t/[slug]/cart/cart-bar';
import { emitAnalyticsEvent } from '@/lib/analytics/emit';
import { localizedField } from '../helpers';
import type { MenuItemSnapshot, ThemeProps } from '../theme.types';

/**
 * Modern theme — minimal, full-bleed image cards, generous whitespace, underline tabs.
 * Matches `qrcode menu/diner.jsx` Modern* components.
 */
export function ModernPage({ restaurant, categories, locale }: ThemeProps): React.JSX.Element {
  const t = useTranslations('tenant');
  const [opened, setOpened] = useState<MenuItemSnapshot | null>(null);

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-diner-theme="modern"
      className="min-h-screen bg-[var(--d-bg)] pb-28 text-[var(--d-text)]"
    >
      <PageViewBeacon restaurantId={restaurant.id} />
      <ModernHeader restaurant={restaurant} locale={locale} />
      {categories.length > 0 ? <ModernTabs categories={categories} locale={locale} /> : null}

      <main className="mx-auto w-full max-w-3xl px-5 pt-2">
        {categories.length === 0 ? (
          <p className="rounded-2xl bg-[var(--d-surface)] p-8 text-center text-sm text-[var(--d-text-soft)]">
            {t('menuComingSoon')}
          </p>
        ) : (
          categories.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-24 pt-6">
              <h2 className="mb-3 font-display text-2xl font-bold tracking-tight text-[var(--d-text)]">
                {localizedField(cat.name, cat.nameAr, locale)}
              </h2>
              <div className="flex flex-col gap-4">
                {cat.items.map((item) => (
                  <ModernItemCard
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
        <footer className="pt-12 text-center text-[11px] uppercase tracking-[0.18em] text-[var(--d-text-soft)]">{t('poweredBy')}</footer>
      </main>

      {opened ? (
        <ModernItemModal
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
