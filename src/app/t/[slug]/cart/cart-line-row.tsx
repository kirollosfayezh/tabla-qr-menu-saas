'use client';

import { useTranslations } from 'next-intl';
import { CART_MAX_QTY } from '@/config/constants';
import { formatPriceForLocale, localizedField } from '@/themes/helpers';
import { unitPriceCents } from './cart-store';
import type { CartLine } from './types';

interface Props {
  line: CartLine;
  currencyCode: string;
  locale: 'en' | 'ar';
  onQty: (qty: number) => void;
  onNotes: (notes: string) => void;
}

export function CartLineRow({ line, currencyCode, locale, onQty, onNotes }: Props): React.JSX.Element {
  const t = useTranslations('tenant.cart');
  const name = localizedField(line.name, line.nameAr, locale);
  const selections = line.selections ?? [];
  const linePrice = unitPriceCents(line) * line.qty;
  return (
    <div className="grid grid-cols-[56px_1fr] gap-3 border-b border-[var(--d-border)] py-4">
      {line.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={line.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
      ) : <div className="h-14 w-14 rounded-lg bg-[var(--d-secondary)]" />}
      <div className="min-w-0 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[var(--d-text)]">{name}</p>
            {selections.length > 0 ? (
              <ul className="mt-1 space-y-0.5">
                {selections.map((s) => (
                  <li key={s.optionId} className="text-[11px] text-[var(--d-text-soft)]">
                    {localizedField(s.groupName, s.groupNameAr, locale)}: {localizedField(s.optionLabel, s.optionLabelAr, locale)}
                    {s.priceDeltaCents !== 0
                      ? ` (${s.priceDeltaCents > 0 ? '+' : ''}${formatPriceForLocale(s.priceDeltaCents, currencyCode, locale)})`
                      : ''}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-1 text-xs font-semibold text-[var(--d-primary)]">
              {formatPriceForLocale(linePrice, currencyCode, locale)}
            </p>
          </div>
          <QtyStepper qty={line.qty} onQty={onQty} label={t('qtyAria', { name })} />
        </div>
        <textarea
          value={line.notes}
          onChange={(event) => onNotes(event.target.value)}
          placeholder={t('notes')}
          className="min-h-14 w-full resize-none rounded-xl border border-[var(--d-border)] bg-[var(--d-surface)] px-3 py-2 text-sm outline-none placeholder:text-[var(--d-text-soft)] focus:border-[var(--d-primary)]"
          maxLength={200}
        />
        <button type="button" onClick={() => onQty(0)} className="text-xs font-semibold text-[var(--d-primary)]">
          {t('remove')}
        </button>
      </div>
    </div>
  );
}

function QtyStepper({
  qty,
  onQty,
  label,
}: {
  qty: number;
  onQty: (qty: number) => void;
  label: string;
}): React.JSX.Element {
  return (
    <div aria-label={label} className="flex h-9 items-center overflow-hidden rounded-full border border-[var(--d-border)] bg-[var(--d-surface)]">
      <button type="button" onClick={() => onQty(qty - 1)} className="h-9 w-9 text-lg text-[var(--d-primary)]">-</button>
      <span className="w-8 text-center text-sm font-semibold">{qty}</span>
      <button
        type="button"
        onClick={() => onQty(qty + 1)}
        disabled={qty >= CART_MAX_QTY}
        className="h-9 w-9 bg-[var(--d-primary)] text-lg text-[var(--d-on-primary)] disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
