'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { CART_MAX_QTY } from '@/config/constants';
import { useCartStore } from '@/app/t/[slug]/cart/cart-store';
import { CloseIcon } from '../classic/icons';
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

export function ModernItemModal(props: Props): React.JSX.Element | null {
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
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 sm:items-center sm:px-4">
      <button type="button" aria-label={t('close')} onClick={onClose} className="absolute inset-0" />
      <article className="relative z-[61] flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[24px] bg-[var(--d-bg)] text-[var(--d-text)] shadow-2xl sm:rounded-[24px]">
        <div className="relative h-72 w-full">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--d-secondary)] to-[var(--d-bg)]" />
          )}
          <button
            type="button"
            aria-label={t('close')}
            onClick={onClose}
            className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-[4px] bg-white text-[var(--d-text)] shadow-md"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6">
          <header>
            <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-[var(--d-text)]">{name}</h2>
            {description ? <p className="mt-3 text-sm leading-relaxed text-[var(--d-text-soft)]">{description}</p> : null}
          </header>
          {item.tags.length > 0 ? (
            <Chips title={t('tags')} values={item.tags} />
          ) : null}
          {item.allergens.length > 0 ? (
            <Chips title={t('allergens')} values={item.allergens} tone="warning" />
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
              {optionError ? <p className="text-sm font-semibold text-red-600">{optionError}</p> : null}
            </div>
          ) : null}
        </div>

        <footer className="space-y-3 border-t border-[var(--d-border)] bg-[var(--d-bg)] p-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={cartT('notes')}
            maxLength={200}
            rows={2}
            className="block w-full resize-none rounded-[4px] border border-[var(--d-border)] bg-[var(--d-surface)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--d-text-soft)] focus:border-[var(--d-primary)]"
          />
          <div className="flex items-center gap-3">
            <div className="flex h-12 shrink-0 items-center rounded-[4px] bg-[var(--d-surface)]">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="h-12 w-11 text-lg text-[var(--d-text)]">-</button>
              <span className="w-9 text-center font-mono text-sm font-bold">{qty}</span>
              <button type="button" onClick={() => setQty(Math.min(CART_MAX_QTY, qty + 1))} className="h-12 w-11 text-lg text-[var(--d-text)]">+</button>
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
              className="flex h-12 flex-1 items-center justify-center rounded-[4px] bg-[var(--d-primary)] px-4 text-[13px] font-bold uppercase tracking-wider text-white disabled:opacity-50"
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

function Chips({ title, values, tone }: { title: string; values: ReadonlyArray<string>; tone?: 'warning' }): React.JSX.Element {
  return (
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--d-text-soft)]">{title}</p>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span
            key={v}
            className={tone === 'warning'
              ? 'border border-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700'
              : 'border border-[var(--d-border)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--d-text-soft)]'}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
