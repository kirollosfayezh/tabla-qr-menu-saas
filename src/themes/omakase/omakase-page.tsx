'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ClassicHeader } from '../classic/classic-header';
import { ClassicTabs } from '../classic/classic-tabs';
import { ClassicItemModal } from '../classic/classic-item-modal';
import { PageViewBeacon } from '../classic/page-view-beacon';
import { CartBar } from '@/app/t/[slug]/cart/cart-bar';
import { PromoTicker } from '../shared/promo-ticker';
import { emitAnalyticsEvent } from '@/lib/analytics/emit';
import { localizedField } from '../helpers';
import { OmakaseItemCard } from './omakase-item-card';
import type { MenuItemSnapshot, ThemeProps } from '../theme.types';

/**
 * Omakase theme — light, editorial serif. Centered hero, a single narrow column
 * of dotted-leader rows. Matches the `editorial` layout in `qrcode menu/`.
 */
export function OmakasePage({ restaurant, categories, locale }: ThemeProps): React.JSX.Element {
  const t = useTranslations('tenant');
  const [opened, setOpened] = useState<MenuItemSnapshot | null>(null);

  return (
    <div
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      data-diner-theme="omakase"
      className="min-h-screen bg-[var(--d-bg)] pb-28 text-[var(--d-text)]"
    >
      <PageViewBeacon restaurantId={restaurant.id} />
      <ClassicHeader restaurant={restaurant} locale={locale} />
      <PromoTicker messages={restaurant.promoMessages} />
      {categories.length > 0 ? <ClassicTabs categories={categories} locale={locale} /> : null}

      <main className="mx-auto w-full max-w-2xl px-5 pt-2">
        {categories.length === 0 ? (
          <p className="border border-[var(--d-border)] bg-[var(--d-surface)] p-8 text-center font-serif italic text-[var(--d-text-soft)]">
            {t('menuComingSoon')}
          </p>
        ) : (
          categories.map((cat) => (
            <section key={cat.id} id={cat.id} className="scroll-mt-20 pt-7">
              <h2 className="mb-1 text-center font-serif text-[26px] font-medium tracking-[0.01em] text-[var(--d-text)]">
                {localizedField(cat.name, cat.nameAr, locale)}
              </h2>
              <div className="mx-auto mb-3 h-px w-10 bg-[var(--d-primary)]" />
              <div>
                {cat.items.map((item) => (
                  <OmakaseItemCard
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
