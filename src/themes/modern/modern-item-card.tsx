'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useCartStore } from '@/app/t/[slug]/cart/cart-store';
import { formatPriceForLocale, localizedField } from '../helpers';
import type { MenuItemSnapshot } from '../theme.types';

const FEATURE_TAGS = new Set(['featured', 'chef-pick', 'chefs-pick', 'chefpick', 'popular']);

interface Props {
  item: MenuItemSnapshot;
  restaurantId: string;
  currencyCode: string;
  locale: 'en' | 'ar';
  onOpen: () => void;
}

/** Modern theme item — full-bleed image with name+desc+price below and a square + button. */
export function ModernItemCard({ item, restaurantId, currencyCode, locale, onOpen }: Props): React.JSX.Element {
  const t = useTranslations('tenant');
  const name = localizedField(item.name, item.nameAr, locale);
  const description = localizedField(item.description ?? '', item.descriptionAr, locale);
  const isFeatured = item.tags.some((tag) => FEATURE_TAGS.has(tag.toLowerCase()));

  return (
    <article className={cn('overflow-hidden rounded-2xl bg-[var(--d-surface)]', !item.isAvailable && 'opacity-55')}>
      <button type="button" onClick={onOpen} disabled={!item.isAvailable} className="block w-full text-start">
        <div className="relative h-40 w-full">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--d-secondary)] to-[var(--d-bg)]" />
          )}
          {isFeatured ? (
            <span className="absolute start-3 top-3 rounded-[4px] bg-[var(--d-secondary)] px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
              {locale === 'ar' ? 'اختيار الشيف' : "Chef's pick"}
            </span>
          ) : null}
        </div>
      </button>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} disabled={!item.isAvailable} className="block min-w-0 text-start">
            <h3 className="font-display text-[17px] font-bold leading-tight tracking-tight text-[var(--d-text)]">{name}</h3>
            {description ? <p className="mt-1 line-clamp-2 text-xs leading-snug text-[var(--d-text-soft)]">{description}</p> : null}
            <p className="mt-2 font-mono text-[15px] font-bold text-[var(--d-text)]">
              {formatPriceForLocale(item.priceCents, currencyCode, locale)}
            </p>
            {!item.isAvailable ? (
              <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--d-text-soft)]">{t('outOfStock')}</p>
            ) : null}
          </button>
        </div>
        <QuickAdd item={item} restaurantId={restaurantId} onOpen={onOpen} />
      </div>
    </article>
  );
}

function QuickAdd({ item, restaurantId, onOpen }: { item: MenuItemSnapshot; restaurantId: string; onOpen: () => void }): React.JSX.Element {
  const add = useCartStore(restaurantId, (state) => state.add);
  const hasOptions = (item.optionGroups ?? []).length > 0;
  return (
    <button
      type="button"
      aria-label="Add"
      disabled={!item.isAvailable}
      onClick={() => (hasOptions ? onOpen() : add(item, 1, '', []))}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] bg-[var(--d-primary)] text-lg font-bold leading-none text-white disabled:opacity-40"
    >
      +
    </button>
  );
}
