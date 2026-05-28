'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ClassicHeader } from './classic-header';
import { ClassicTabs } from './classic-tabs';
import { ClassicItemCard } from './classic-item-card';
import { ClassicItemModal } from './classic-item-modal';
import { PageViewBeacon } from './page-view-beacon';
import { CartBar } from '@/app/t/[slug]/cart/cart-bar';
import { localizedField } from '../helpers';
import { emitAnalyticsEvent } from '@/lib/analytics/emit';
import type { MenuItemSnapshot, ThemeProps } from '../theme.types';

/** Classic diner page. Hero header + sticky tabs + sectioned item lists + detail modal. */
export function ClassicPage({ restaurant, categories, locale }: ThemeProps): React.JSX.Element {
  const t = useTranslations('tenant');
  const [opened, setOpened] = useState<MenuItemSnapshot | null>(null);

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-diner-theme="classic"
      className="min-h-screen bg-[var(--d-bg)] pb-28 text-[var(--d-text)]"
    >
      <PageViewBeacon restaurantId={restaurant.id} />
      <ClassicHeader restaurant={restaurant} locale={locale} />
      {categories.length > 0 ? (
        <ClassicTabs categories={categories} locale={locale} />
      ) : null}

      <main className="mx-auto w-full max-w-3xl px-4 pt-2">
        {categories.length === 0 ? (
          <p className="rounded-2xl border border-[var(--d-border)] bg-[var(--d-surface)] p-8 text-center text-sm text-[var(--d-text-soft)] shadow-sm">
            {t('menuComingSoon')}
          </p>
        ) : (
          categories.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-20 pt-5">
              <h2 className="mb-1 font-serif text-[22px] font-semibold text-[var(--d-text)]">
                {localizedField(cat.name, cat.nameAr, locale)}
              </h2>
              <div className="divide-y divide-[var(--d-border)]">
                {cat.items.map((item) => (
                  <ClassicItemCard
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

        <footer className="pt-10 text-center text-xs text-[var(--d-text-soft)]">{t('poweredBy')}</footer>
      </main>

      {opened ? (
        <ClassicItemModal
          item={opened}
          restaurantId={restaurant.id}
          currencyCode={restaurant.currencyCode}
          locale={locale}
          primaryColor={restaurant.primaryColor}
          onClose={() => setOpened(null)}
        />
      ) : null}
      <CartBar restaurant={restaurant} locale={locale} />
    </div>
  );
}
