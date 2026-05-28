'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { useCartStore } from '@/app/t/[slug]/cart/cart-store';
import { formatPriceForLocale, localizedField } from '../helpers';
import type { MenuItemSnapshot } from '../theme.types';
import { StarIcon } from './icons';

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

/** A single item card in the Classic theme. Click → opens the detail modal. */
export function ClassicItemCard({ item, restaurantId, currencyCode, locale, onOpen }: Props): React.JSX.Element {
  const t = useTranslations('tenant');
  const name = localizedField(item.name, item.nameAr, locale);
  const description = localizedField(item.description ?? '', item.descriptionAr, locale);
  const feature = featureLabel(item, locale);

  return (
    <article
      className={cn(
        'flex w-full gap-3 py-4 text-start',
        !item.isAvailable && 'opacity-55',
      )}
    >
      <button
      type="button"
      onClick={onOpen}
      disabled={!item.isAvailable}
      className={cn(
        'group flex min-w-0 flex-1 gap-3 text-start transition active:scale-[0.99]',
        !item.isAvailable && 'cursor-not-allowed',
      )}
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt=""
          className="h-[84px] w-[84px] shrink-0 rounded-[14px] object-cover"
        />
      ) : (
        <div className="h-[84px] w-[84px] shrink-0 rounded-[14px] bg-[var(--d-secondary)]" />
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="space-y-1.5">
          {feature ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--d-primary)]">
              <StarIcon size={10} /> {feature}
            </span>
          ) : null}
          <h3 className="font-serif text-[17px] font-semibold leading-tight text-[var(--d-text)]">{name}</h3>
          {description ? (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-[var(--d-text-soft)]">{description}</p>
          ) : null}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--d-primary)]">
            {formatPriceForLocale(item.priceCents, currencyCode, locale)}
          </span>
          {!item.isAvailable ? (
            <span className="rounded-full bg-black/5 px-2 py-0.5 text-[11px] uppercase tracking-wide text-[var(--d-text)] opacity-70">
              {t('outOfStock')}
            </span>
          ) : null}
        </div>
      </div>
      </button>
      <QuickAdd item={item} restaurantId={restaurantId} onOpen={onOpen} />
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
      className="mt-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--d-primary)] text-lg font-semibold leading-none text-[var(--d-on-primary)] shadow-md disabled:bg-black/20"
    >
      +
    </button>
  );
}
