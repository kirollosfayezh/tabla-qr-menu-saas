'use client';

import { StoreIcon } from '@/components/store/store-icon';
import { THEMES } from '@/components/store/store-data';
import type { ThemeKey } from '@/components/store/store-data';

export interface ThemeRow {
  id: string;
  key: ThemeKey;
  name: string;
  isFree: boolean;
  priceCents: number;
  isInPlan: boolean;
  currencyCode: string;
}

/** Free / in-plan / price chip. Hidden for the active theme (the card already marks it). */
function StatusBadge({ theme, isCurrent }: { theme: ThemeRow; isCurrent: boolean }): React.JSX.Element | null {
  if (isCurrent) return null;
  if (theme.isFree) return <span className="text-xs font-semibold text-success">Free</span>;
  if (theme.isInPlan) return <span className="text-xs font-semibold text-info">Included in plan</span>;
  return <span className="text-xs font-semibold text-text-secondary">{theme.currencyCode} {Math.round(theme.priceCents / 100).toLocaleString()}</span>;
}

interface CardFooterProps {
  theme: ThemeRow;
  isActive: boolean;
  isPending: boolean;
  onPreview: () => void;
  onCustomize: () => void;
  onUse: () => void;
}

/** Owner-side card footer: identity, status, and the Preview / Customize / Use actions. */
export function CardFooter({ theme, isActive, isPending, onPreview, onCustomize, onUse }: CardFooterProps): React.JSX.Element {
  const secondaryBtn = 'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border-default bg-surface-base px-3 text-xs font-semibold text-text-primary transition hover:bg-surface-raised';
  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{theme.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{THEMES[theme.key].sub}</div>
        </div>
        <StatusBadge theme={theme} isCurrent={isActive} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={onPreview} className={secondaryBtn}>
          <StoreIcon name="eye" size={14} />Preview
        </button>
        <button type="button" onClick={onCustomize} className={secondaryBtn}>
          <StoreIcon name="palette" size={14} />Customize
        </button>
        {isActive ? (
          <span className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-brand-primary-soft px-3 text-xs font-bold text-brand-primary-dark">
            <StoreIcon name="check" size={14} stroke={3} />Active
          </span>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={onUse}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-primary px-3 text-xs font-semibold text-white transition hover:bg-brand-primary-dark disabled:opacity-50"
          >
            Use it
          </button>
        )}
      </div>
    </div>
  );
}
