'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { CART_MAX_QTY } from '@/config/constants';
import { useCartStore } from '@/app/t/[slug]/cart/cart-store';
import { formatPriceForLocale, localizedField } from '../helpers';
import type { MenuItemSnapshot } from '../theme.types';
import { ChevronStartIcon, CloseIcon, StarIcon } from './icons';

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
  primaryColor: string;
  onClose: () => void;
}

/** Full-screen item detail with quantity, line notes, and add-to-cart actions. */
export function ClassicItemModal(props: Props): React.JSX.Element | null {
  const { item, restaurantId, currencyCode, locale, primaryColor, onClose } = props;
  const t = useTranslations('tenant');
  const add = useCartStore(restaurantId, (state) => state.add);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const target = typeof document === 'undefined' ? null : document.body;

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!target) return null;
  const name = localizedField(item.name, item.nameAr, locale);
  const description = localizedField(item.description ?? '', item.descriptionAr, locale);
  const feature = featureLabel(item, locale);
  const priceLabel = formatPriceForLocale(item.priceCents * qty, currencyCode, locale);

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-end justify-center bg-[rgba(42,24,16,0.52)] backdrop-blur-sm sm:items-center sm:px-4">
      <button type="button" aria-label={t('close')} onClick={onClose} className="absolute inset-0" />
      <article className="relative z-[61] flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] bg-[var(--d-bg)] text-[var(--d-text)] shadow-2xl sm:rounded-[28px]">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="h-64 w-full object-cover" />
        ) : (
          <div className="h-40 w-full bg-[var(--d-secondary)]" />
        )}
        <button
          type="button"
          aria-label={t('close')}
          onClick={onClose}
          className="absolute start-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--d-text)] shadow-sm rtl:rotate-180"
        >
          <ChevronStartIcon size={18} />
        </button>
        <div className="space-y-4 overflow-y-auto p-6">
          <header className="space-y-2">
            {feature ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--d-primary)]">
                <StarIcon size={10} /> {feature}
              </span>
            ) : null}
            <h2 className="font-serif text-[30px] font-semibold leading-tight text-[var(--d-text)]">{name}</h2>
            <span className="block text-lg font-bold text-[var(--d-primary)]">
              {formatPriceForLocale(item.priceCents, currencyCode, locale)}
            </span>
          </header>
          {description ? (
            <p className="text-sm leading-7 text-[var(--d-text-soft)]">{description}</p>
          ) : null}
          {item.tags.length > 0 ? (
            <Section title={t('tags')} values={item.tags} />
          ) : null}
          {item.allergens.length > 0 ? (
            <Section title={t('allergens')} values={item.allergens} tone="warning" />
          ) : null}
        </div>
        <CartFooter
          item={item}
          qty={qty}
          notes={notes}
          primaryColor={primaryColor}
          priceLabel={priceLabel}
          onQty={setQty}
          onNotes={setNotes}
          onAdd={() => {
            add(item, qty, notes);
            onClose();
          }}
        />
      </article>
    </div>,
    target,
  );
}

function CartFooter({
  item,
  qty,
  notes,
  primaryColor,
  priceLabel,
  onQty,
  onNotes,
  onAdd,
}: {
  item: MenuItemSnapshot;
  qty: number;
  notes: string;
  primaryColor: string;
  priceLabel: string;
  onQty: (qty: number) => void;
  onNotes: (notes: string) => void;
  onAdd: () => void;
}): React.JSX.Element {
  const cartT = useTranslations('tenant.cart');
  return (
    <footer className="space-y-3 border-t border-[var(--d-border)] bg-[var(--d-bg)] p-4">
      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--d-text)]">{cartT('notes')}</span>
        <textarea
          value={notes}
          onChange={(event) => onNotes(event.target.value)}
          placeholder={cartT('notes')}
          maxLength={200}
          rows={2}
          className="block w-full resize-none rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--d-text-soft)] focus:border-[var(--d-primary)]"
        />
      </label>
      <div className="flex items-center gap-3">
        <div aria-label={cartT('qty')} className="flex h-12 shrink-0 items-center overflow-hidden rounded-full border border-[var(--d-border)] bg-[var(--d-surface)]">
          <button type="button" onClick={() => onQty(Math.max(1, qty - 1))} className="h-12 w-11 text-lg text-[var(--d-primary)]">-</button>
          <span className="w-9 text-center text-sm font-semibold">{qty}</span>
          <button type="button" onClick={() => onQty(Math.min(CART_MAX_QTY, qty + 1))} className="h-12 w-11 bg-[var(--d-primary)] text-lg text-white">+</button>
        </div>
        <button
          type="button"
          disabled={!item.isAvailable}
          onClick={onAdd}
          className="flex h-12 flex-1 items-center justify-center rounded-2xl px-4 text-sm font-bold text-white shadow-lg disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}
        >
          {cartT('addToCart')} · {priceLabel}
        </button>
      </div>
    </footer>
  );
}

function Section({
  title,
  values,
  tone,
}: {
  title: string;
  values: ReadonlyArray<string>;
  tone?: 'warning';
}): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--d-text)] opacity-60">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className={
              tone === 'warning'
                ? 'rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-900'
                : 'rounded-full bg-black/5 px-2.5 py-0.5 text-xs text-[var(--d-text)]'
            }
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
