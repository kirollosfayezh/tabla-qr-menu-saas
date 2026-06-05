'use client';

/* eslint-disable max-lines, max-lines-per-function */

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CartBar } from '@/app/t/[slug]/cart/cart-bar';
import { useCartStore } from '@/app/t/[slug]/cart/cart-store';
import { emitAnalyticsEvent } from '@/lib/analytics/emit';
import { formatPriceForLocale, localizedField } from '../helpers';
import { ClassicHeaderActions, ClassicTableBadge } from '../classic/header-actions';
import { ClassicItemModal } from '../classic/classic-item-modal';
import { cn } from '@/lib/cn';
import { heroTransform } from '../shared/hero-strip';
import { PromoTicker } from '../shared/promo-ticker';
import type { CategoryWithItems, HeroPhoto, MenuItemSnapshot, ThemeProps } from '../theme.types';

export type ShowcaseVariant = 'market' | 'neon' | 'coastal' | 'street';

const VARIANT: Record<ShowcaseVariant, {
  label: string;
  shell: string;
  hero: string;
  heading: string;
  card: string;
  radius: string;
  image: string;
}> = {
  market: {
    label: 'Fresh picks',
    shell: 'bg-[var(--d-bg)]',
    hero: 'bg-[var(--d-surface)] border border-[var(--d-border)]',
    heading: 'font-serif',
    card: 'bg-[var(--d-surface)] border border-[var(--d-border)] shadow-sm',
    radius: 'rounded-[22px]',
    image: 'rounded-[18px]',
  },
  neon: {
    label: 'Late menu',
    shell: 'bg-[#07080c] text-white',
    hero: 'bg-[#11131d] border border-white/10',
    heading: 'font-display uppercase tracking-[0.02em]',
    card: 'bg-[#10131b] border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.28)]',
    radius: 'rounded-[10px]',
    image: 'rounded-[8px]',
  },
  coastal: {
    label: 'Today by the water',
    shell: 'bg-[color-mix(in_srgb,var(--d-secondary)_9%,#ffffff)]',
    hero: 'bg-[var(--d-surface)] border border-[var(--d-border)]',
    heading: 'font-display',
    card: 'bg-[var(--d-surface)] border border-[var(--d-border)] shadow-sm',
    radius: 'rounded-[28px]',
    image: 'rounded-[24px]',
  },
  street: {
    label: 'Hot counter',
    shell: 'bg-[var(--d-bg)]',
    hero: 'bg-[var(--d-secondary)] text-[var(--d-on-secondary)]',
    heading: 'font-display uppercase',
    card: 'bg-[var(--d-surface)] border-2 border-[var(--d-text)] shadow-[5px_5px_0_var(--d-text)]',
    radius: 'rounded-[6px]',
    image: 'rounded-[4px]',
  },
};

export function ShowcasePage({ restaurant, categories, locale, variant }: ThemeProps & { variant: ShowcaseVariant }): React.JSX.Element {
  const t = useTranslations('tenant');
  const [opened, setOpened] = useState<MenuItemSnapshot | null>(null);
  const config = VARIANT[variant];
  const name = localizedField(restaurant.name, restaurant.nameAr, locale);
  const heroPhotos = useMemo(
    () => (restaurant.heroPhotos ?? []).length > 0
      ? restaurant.heroPhotos
      : categories
          .flatMap((category) => category.items)
          .map((item) => item.imageUrl)
          .filter((url): url is string => Boolean(url))
          .slice(0, 4)
          .map((url) => ({ url, rotation: 0 as const, flipX: false, flipY: false })),
    [categories, restaurant.heroPhotos],
  );

  function open(item: MenuItemSnapshot): void {
    emitAnalyticsEvent({ restaurantId: restaurant.id, eventType: 'ITEM_VIEW', metadata: { itemId: item.id } });
    setOpened(item);
  }

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} data-diner-theme={variant} className={cn('min-h-screen pb-28 text-[var(--d-text)]', config.shell)}>
      <style jsx>{`
        @keyframes tablaHeroPan { 0%, 100% { transform: translateX(0) scale(1.02); } 50% { transform: translateX(-8%) scale(1.08); } }
        @keyframes tablaFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .tabla-hero-photo { animation: tablaHeroPan 12s ease-in-out infinite; }
        .tabla-float { animation: tablaFloat 4s ease-in-out infinite; }
      `}</style>
      <header className="mx-auto w-full max-w-5xl px-4 pb-4 pt-5 sm:px-6">
        <ClassicHeaderActions locale={locale} />
        <div className={cn('mt-3 overflow-hidden p-4 sm:p-5', config.hero, config.radius)}>
          <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr] sm:items-stretch">
            <div className="flex min-h-[220px] flex-col justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[var(--d-primary)]">{config.label}</p>
                <h1 className={cn('mt-3 text-4xl font-black leading-[0.95] sm:text-6xl', config.heading)}>{name}</h1>
                {restaurant.description ? (
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--d-text-soft)]">
                    {localizedField(restaurant.description, restaurant.descriptionAr, locale)}
                  </p>
                ) : null}
              </div>
              <ClassicTableBadge restaurantId={restaurant.id} locale={locale} />
            </div>
            <HeroPhotos
              photos={heroPhotos}
              fallback={name}
              imageClass={config.image}
              layout={restaurant.heroLayout}
              scale={restaurant.heroImageScale}
            />
          </div>
        </div>
      </header>

      <PromoTicker messages={restaurant.promoMessages} />
      <CategoryRail categories={categories} locale={locale} />

      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {categories.length === 0 ? (
          <p className={cn('p-8 text-center text-sm text-[var(--d-text-soft)]', config.card, config.radius)}>{t('menuComingSoon')}</p>
        ) : (
          categories.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-24 pt-7">
              <h2 className={cn('mb-4 text-2xl font-black text-[var(--d-text)]', config.heading)}>
                {localizedField(category.name, category.nameAr, locale)}
              </h2>
              <div className={variant === 'neon' ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4'}>
                {category.items.map((item, index) => (
                  <ShowcaseItem
                    key={item.id}
                    item={item}
                    restaurantId={restaurant.id}
                    currencyCode={restaurant.currencyCode}
                    locale={locale}
                    onOpen={() => open(item)}
                    config={config}
                    index={index}
                  />
                ))}
              </div>
            </section>
          ))
        )}
        <footer className="pt-12 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[var(--d-text-soft)]">{t('poweredBy')}</footer>
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

function HeroPhotos({
  photos,
  fallback,
  imageClass,
  layout,
  scale,
}: {
  photos: ReadonlyArray<HeroPhoto>;
  fallback: string;
  imageClass: string;
  layout: 'featured' | 'grid' | 'strip' | 'stack';
  scale: number;
}): React.JSX.Element {
  const visible = photos.slice(0, 6);
  const zoom = Math.max(0.7, Math.min(1.4, scale / 100));
  if (visible.length === 0) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-[inherit] bg-[var(--d-secondary)] text-6xl font-black text-[var(--d-on-secondary)]">
        {fallback.slice(0, 1)}
      </div>
    );
  }
  if (layout === 'grid') {
    return (
      <div className="grid min-h-[220px] grid-cols-2 gap-2 overflow-hidden rounded-[inherit] bg-[var(--d-primary-soft)] p-2">
        {visible.slice(0, 4).map((photo) => (
          <HeroImage key={photo.url} photo={photo} imageClass={imageClass} zoom={zoom} />
        ))}
      </div>
    );
  }
  if (layout === 'strip') {
    return (
      <div className="flex min-h-[220px] gap-2 overflow-hidden rounded-[inherit] bg-[var(--d-primary-soft)] p-2">
        {visible.slice(0, 4).map((photo) => (
          <div key={photo.url} className="min-w-[42%] flex-1">
            <HeroImage photo={photo} imageClass={imageClass} zoom={zoom} />
          </div>
        ))}
      </div>
    );
  }
  if (layout === 'stack') {
    return (
      <div className="relative min-h-[220px] overflow-hidden rounded-[inherit] bg-[var(--d-primary-soft)]">
        {visible.slice(0, 3).map((photo, index) => (
          <div
            key={photo.url}
            className={cn('absolute overflow-hidden shadow-lg', imageClass, index === 0 ? 'inset-3' : 'h-28 w-28 tabla-float')}
            style={index === 1 ? { insetInlineEnd: 14, bottom: 18, animationDelay: '0.3s' } : index === 2 ? { insetInlineStart: 18, bottom: 16, animationDelay: '0.8s' } : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.url} alt="" className="tabla-hero-photo h-full w-full object-cover" style={{ transform: heroTransform(photo, zoom) }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="min-h-[220px] overflow-hidden rounded-[inherit] bg-[var(--d-primary-soft)] p-2">
      <HeroImage photo={visible[0]!} imageClass={imageClass} zoom={zoom} />
    </div>
  );
}

function HeroImage({ photo, imageClass, zoom }: { photo: HeroPhoto; imageClass: string; zoom: number }): React.JSX.Element {
  return (
    <div className={cn('h-full min-h-[104px] overflow-hidden', imageClass)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt="" className="h-full w-full object-cover transition duration-700 hover:scale-105" style={{ transform: heroTransform(photo, zoom) }} />
    </div>
  );
}

function CategoryRail({ categories, locale }: { categories: ReadonlyArray<CategoryWithItems>; locale: 'en' | 'ar' }): React.JSX.Element | null {
  if (categories.length === 0) return null;
  return (
    <nav className="sticky top-0 z-30 border-y border-[var(--d-border)] bg-[var(--d-surface)] px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-5xl gap-2 overflow-x-auto">
        {categories.map((category, index) => (
          <a
            key={category.id}
            href={`#${category.id}`}
            className={cn('shrink-0 rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.08em]', index === 0 ? 'bg-[var(--d-primary)] text-[var(--d-on-primary)]' : 'bg-[var(--d-primary-soft)] text-[var(--d-primary)]')}
          >
            {localizedField(category.name, category.nameAr, locale)}
          </a>
        ))}
      </div>
    </nav>
  );
}

function ShowcaseItem({
  item,
  restaurantId,
  currencyCode,
  locale,
  onOpen,
  config,
  index,
}: {
  item: MenuItemSnapshot;
  restaurantId: string;
  currencyCode: string;
  locale: 'en' | 'ar';
  onOpen: () => void;
  config: (typeof VARIANT)[ShowcaseVariant];
  index: number;
}): React.JSX.Element {
  const t = useTranslations('tenant');
  const add = useCartStore(restaurantId, (state) => state.add);
  const name = localizedField(item.name, item.nameAr, locale);
  const description = localizedField(item.description ?? '', item.descriptionAr, locale);
  const hasOptions = item.optionGroups.length > 0;

  return (
    <article className={cn('group grid gap-3 p-3 transition duration-300 hover:-translate-y-0.5', config.card, config.radius, !item.isAvailable && 'opacity-55')} style={{ animationDelay: `${index * 80}ms` }}>
      <button type="button" onClick={onOpen} disabled={!item.isAvailable} className="grid gap-3 text-start sm:grid-cols-[112px_1fr]">
        <div className={cn('h-28 overflow-hidden bg-[var(--d-primary-soft)] sm:h-28', config.image)}>
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
          ) : (
            <div className="h-full w-full bg-[linear-gradient(135deg,var(--d-primary-soft),var(--d-secondary-soft),var(--d-accent-soft))]" />
          )}
        </div>
        <div className="flex min-w-0 flex-col justify-between py-1">
          <div>
            <h3 className="text-lg font-black leading-tight text-[var(--d-text)]">{name}</h3>
            {description ? <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--d-text-soft)]">{description}</p> : null}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-mono text-base font-black text-[var(--d-primary)]">{formatPriceForLocale(item.priceCents, currencyCode, locale)}</span>
            {!item.isAvailable ? <span className="text-xs font-bold uppercase text-[var(--d-text-soft)]">{t('outOfStock')}</span> : null}
          </div>
        </div>
      </button>
      <button
        type="button"
        disabled={!item.isAvailable}
        onClick={() => (hasOptions ? onOpen() : add(item, 1, '', []))}
        className="rounded-xl bg-[var(--d-primary)] px-4 py-3 text-sm font-black text-[var(--d-on-primary)] transition active:scale-[0.98] disabled:opacity-40"
      >
        {t('addToCart')}
      </button>
    </article>
  );
}
