'use client';

import { useTransition } from 'react';
import { setLocaleCookie } from '@/app/actions/locale.action';
import { useCartStore } from '@/app/t/[slug]/cart/cart-store';
import { CheckIcon, SearchIcon } from './icons';

interface ActionsProps {
  locale: 'en' | 'ar';
}

/** Top row of the Classic header: search affordance and language toggle. */
export function ClassicHeaderActions({ locale }: ActionsProps): React.JSX.Element {
  const [pending, start] = useTransition();
  const next = locale === 'ar' ? 'en' : 'ar';
  const nextLabel = locale === 'ar' ? 'EN' : 'عر';
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        type="button"
        aria-label="Search"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--d-border)] bg-[var(--d-surface)] text-[var(--d-text)]"
      >
        <SearchIcon size={16} />
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(() => setLocaleCookie(next))}
        aria-label="Switch language"
        className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--d-border)] bg-[var(--d-surface)] px-3 text-xs font-semibold text-[var(--d-text)]"
      >
        {nextLabel}
      </button>
    </div>
  );
}

interface BadgeProps {
  restaurantId: string;
  locale: 'en' | 'ar';
}

/** Pill showing the active table number when the diner has entered one. */
export function ClassicTableBadge({ restaurantId, locale }: BadgeProps): React.JSX.Element | null {
  const tableNumber = useCartStore(restaurantId, (state) => state.tableNumber);
  if (!tableNumber) return null;
  const label = locale === 'ar' ? `طاولة ${tableNumber}` : `Table ${tableNumber}`;
  return (
    <div className="mt-3 flex justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--d-secondary)] px-3 py-1.5 text-xs font-semibold text-[var(--d-primary)]">
        <CheckIcon size={12} />
        {label}
      </span>
    </div>
  );
}
