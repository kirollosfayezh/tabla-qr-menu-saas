'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { CART_MAX_QTY } from '@/config/constants';
import { useCartStore } from '@/app/t/[slug]/cart/cart-store';
import { ChevronStartIcon } from '../classic/icons';
import { formatPriceForLocale, localizedField } from '../helpers';
import { OptionPicker, validateSelections } from '../shared/option-picker';
import type { MenuItemSnapshot } from '../theme.types';
import type { CartSelection } from '@/app/t/[slug]/cart/types';

interface Props {
  item: MenuItemSnapshot;
  restaurantId: string;
  currencyCode: string;
  locale: 'en' | 'ar';
  onClose: () => void;
}

export function ElegantItemModal(props: Props): React.JSX.Element | null {
  const { item, restaurantId, currencyCode, locale, onClose } = props;
  const t = useTranslations('tenant');
  const cartT = useTranslations('tenant.cart');
  const add = useCartStore(restaurantId, (state) => state.add);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [selections, setSelections] = useState<ReadonlyArray<CartSelection>>([]);
  const [optionError, setOptionError] = useState('');
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
  const unitPrice = item.priceCents + selections.reduce((sum, s) => sum + s.priceDeltaCents, 0);
  const totalLabel = formatPriceForLocale(unitPrice * qty, currencyCode, locale);

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center sm:px-4">
      <button type="button" aria-label={t('close')} onClick={onClose} className="absolute inset-0" />
      <article className="relative z-[61] flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden border-t border-[var(--d-primary)] bg-[var(--d-bg)] text-[var(--d-text)] shadow-2xl sm:border sm:rounded-none">
        <div className="relative h-72 w-full">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--d-secondary)] to-[var(--d-bg)]" />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--d-bg)]" />
          <button
            type="button"
            aria-label={t('close')}
            onClick={onClose}
            className="absolute start-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--d-primary)] bg-black/40 text-[var(--d-primary)] backdrop-blur rtl:rotate-180"
          >
            <ChevronStartIcon size={16} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6">
          <header>
            <h2 className="font-serif text-3xl font-normal leading-tight tracking-wide text-[var(--d-text)]">{name}</h2>
            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-mono text-lg font-semibold text-[var(--d-primary)]">{formatPriceForLocale(item.priceCents, currencyCode, locale)}</span>
              <span className="h-px flex-1 bg-[var(--d-border)]" />
            </div>
          </header>
          {description ? <p className="font-serif text-sm italic leading-relaxed text-[var(--d-text-soft)]">&ldquo;{description}&rdquo;</p> : null}
          {item.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((v) => (
                <span key={v} className="border border-[var(--d-border)] px-2 py-0.5 font-serif text-[10px] italic text-[var(--d-primary)]">{v}</span>
              ))}
            </div>
          ) : null}
          {(item.optionGroups ?? []).length > 0 ? (
            <div className="space-y-2">
              <OptionPicker
                groups={item.optionGroups ?? []}
                value={selections}
                onChange={(next) => {
                  setSelections(next);
                  setOptionError('');
                }}
                currencyCode={currencyCode}
                locale={locale}
              />
              {optionError ? <p className="text-sm font-semibold text-red-400">{optionError}</p> : null}
            </div>
          ) : null}
        </div>

        <footer className="space-y-3 border-t border-[var(--d-primary)]/40 bg-[var(--d-bg)] p-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={cartT('notes')}
            maxLength={200}
            rows={2}
            className="block w-full resize-none border border-[var(--d-border)] bg-[var(--d-surface)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--d-text-soft)] focus:border-[var(--d-primary)]"
          />
          <div className="flex items-center gap-3">
            <div className="flex h-12 shrink-0 items-center border border-[var(--d-primary)]">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-11 text-lg text-[var(--d-primary)]">-</button>
              <span className="w-9 text-center font-mono text-sm font-bold text-[var(--d-primary)]">{qty}</span>
              <button type="button" onClick={() => setQty(Math.min(CART_MAX_QTY, qty + 1))} className="h-12 w-11 text-lg text-[var(--d-primary)]">+</button>
            </div>
            <button
              type="button"
              disabled={!item.isAvailable}
              onClick={() => {
                const valid = validateSelections(item.optionGroups ?? [], selections);
                if (!valid.ok) {
                  setOptionError(localizedField(valid.firstMissing?.name ?? '', valid.firstMissing?.nameAr ?? null, locale));
                  return;
                }
                add(item, qty, notes, selections);
                onClose();
              }}
              className="flex h-12 flex-1 items-center justify-center bg-[var(--d-primary)] px-4 font-serif text-sm font-bold uppercase tracking-wider text-[var(--d-bg)] disabled:opacity-50"
            >
              {cartT('addToCart')} · {totalLabel}
            </button>
          </div>
        </footer>
      </article>
    </div>,
    target,
  );
}
