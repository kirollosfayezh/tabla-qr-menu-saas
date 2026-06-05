'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useCartStore } from '@/app/t/[slug]/cart/cart-store';
import { formatPriceForLocale, localizedField } from '../helpers';
import type { MenuItemSnapshot } from '../theme.types';

const FEATURE_TAGS = new Set(['featured', 'chef-pick', 'chefs-pick', 'chefpick', 'popular']);
function featureLabel(item: MenuItemSnapshot, locale: 'en' | 'ar'): string | null {
  const tag = item.tags.find((t) => FEATURE_TAGS.has(t.toLowerCase()));
  if (!tag) return null;
  return locale === 'ar' ? 'اختيار الشيف' : "Chef's pick";
}

interface Props {
  item: MenuItemSnapshot;
  restaurantId: string;
  currencyCode: string;
  locale: 'en' | 'ar';
  onOpen: () => void;
}

/**
 * Omakase editorial row — name and price joined by a dotted leader, italic serif
 * description, optional small square photo. Matches the `editorial` Dish layout
 * in `qrcode menu/menu-parts.jsx`.
 */
export function OmakaseItemCard({ item, restaurantId, currencyCode, locale, onOpen }: Props): React.JSX.Element {
  const t = useTranslations('tenant');
  const name = localizedField(item.name, item.nameAr, locale);
  const description = localizedField(item.description ?? '', item.descriptionAr, locale);
  const feature = featureLabel(item, locale);

  return (
    <article className={cn('flex gap-4 border-b border-[var(--d-border)] py-4', !item.isAvailable && 'opacity-55')}>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="h-[66px] w-[66px] shrink-0 rounded-[3px] object-cover" />
      ) : null}
      <div className="min-w-0 flex-1">
        <button type="button" onClick={onOpen} disabled={!item.isAvailable} className="block w-full text-start">
          <div className="flex items-baseline gap-2">
            <h3 className="font-serif text-lg font-medium leading-tight tracking-[0.01em] text-[var(--d-text)]">{name}</h3>
            <span className="-translate-y-1 flex-1 border-b border-dotted border-[var(--d-border)]" />
            <span className="font-mono text-[15px] font-bold text-[var(--d-primary)]">
              {formatPriceForLocale(item.priceCents, currencyCode, locale)}
            </span>
          </div>
          {description ? (
            <p className="mt-1 line-clamp-2 font-serif text-[13px] italic leading-relaxed text-[var(--d-text-soft)]">{description}</p>
          ) : null}
        </button>
        <div className="mt-2 flex items-center justify-between gap-2">
          {feature ? (
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--d-primary)]">★ {feature}</span>
          ) : !item.isAvailable ? (
            <span className="text-[10px] uppercase tracking-wide text-[var(--d-text-soft)]">{t('outOfStock')}</span>
          ) : (
            <span />
          )}
          <QuickAdd item={item} restaurantId={restaurantId} onOpen={onOpen} />
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
      onClick={() => (hasOptions ? onOpen() : add(item, 1, '', []))}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[3px] bg-[var(--d-primary)] text-base font-semibold leading-none text-[var(--d-on-primary)] disabled:opacity-40"
    >
      +
    </button>
  );
}
