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

/** Elegant theme item — small square card with serif name and outlined + button. */
export function ElegantItemCard({ item, restaurantId, currencyCode, locale, onOpen }: Props): React.JSX.Element {
  const t = useTranslations('tenant');
  const name = localizedField(item.name, item.nameAr, locale);
  const description = localizedField(item.description ?? '', item.descriptionAr, locale);
  const isFeatured = item.tags.some((tag) => FEATURE_TAGS.has(tag.toLowerCase()));

  return (
    <article
      className={cn(
        'overflow-hidden border border-[var(--d-border)] bg-[var(--d-surface)]',
        !item.isAvailable && 'opacity-55',
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
      <div
        role="button"
        tabIndex={item.isAvailable ? 0 : -1}
        onClick={item.isAvailable ? onOpen : undefined}
        onKeyDown={(e) => { if (item.isAvailable && (e.key === 'Enter' || e.key === ' ')) onOpen(); }}
        className="block w-full cursor-pointer text-start"
      >
        <div className="relative h-24 w-full">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--d-secondary)] to-[var(--d-bg)]" />
          )}
          {isFeatured ? (
            <span className="absolute end-1.5 top-1.5 bg-[var(--d-primary)] px-1.5 py-0.5 font-serif text-[10px] font-bold text-[var(--d-bg)]">★</span>
          ) : null}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 font-serif text-sm font-semibold text-[var(--d-text)]">{name}</h3>
          {description ? <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-[var(--d-text-soft)]">{description}</p> : null}
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-[var(--d-primary)]">
              {formatPriceForLocale(item.priceCents, currencyCode, locale)}
            </span>
            <QuickAdd item={item} restaurantId={restaurantId} onOpen={onOpen} />
          </div>
          {!item.isAvailable ? (
            <p className="mt-1 font-serif text-[10px] italic text-[var(--d-text-soft)]">{t('outOfStock')}</p>
          ) : null}
        </div>
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
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (hasOptions) onOpen();
        else add(item, 1, '', []);
      }}
      className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--d-primary)] text-sm leading-none text-[var(--d-primary)] disabled:opacity-40"
    >
      +
    </button>
  );
}
