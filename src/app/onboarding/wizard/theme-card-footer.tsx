'use client';

import { useTranslations } from 'next-intl';
import { StoreIcon } from '@/components/store/store-icon';
import { THEMES } from '@/components/store/store-data';
import type { ThemeKey } from '@/components/store/store-data';
import type { ThemeOption } from './types';

interface Props {
  option: ThemeOption;
  selected: boolean;
  onPreview: () => void;
  onSelect: () => void;
}

const SECONDARY_BTN =
  'inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border-default bg-surface-base px-3 text-xs font-semibold text-text-primary transition hover:bg-surface-raised';

/**
 * Onboarding theme-card footer. Mirrors the owner studio footer but gates
 * selection to free themes only — premium themes can be previewed yet stay
 * locked until the owner upgrades after setup.
 */
export function ThemeCardFooter({ option, selected, onPreview, onSelect }: Props): React.JSX.Element {
  const t = useTranslations('onboarding.themes');
  const sub = THEMES[option.key as ThemeKey].sub;
  return (
    <div className="flex flex-col gap-3 px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-[17px] font-bold leading-tight tracking-tight text-text-primary">
            {option.name}
          </div>
          <div className="mt-px text-xs text-text-tertiary">{sub}</div>
        </div>
        {option.isFree ? (
          <span className="shrink-0 text-xs font-semibold text-success">{t('free')}</span>
        ) : (
          <span className="shrink-0 text-xs font-semibold text-warning">{t('paid')}</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={onPreview} className={SECONDARY_BTN}>
          <StoreIcon name="eye" size={14} />
          {t('preview')}
        </button>
        {selected ? (
          <span className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-brand-primary-soft px-3 text-xs font-bold text-brand-primary-dark">
            <StoreIcon name="check" size={14} stroke={3} />
            {t('selected')}
          </span>
        ) : option.isFree ? (
          <button
            type="button"
            onClick={onSelect}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-brand-primary px-3 text-xs font-semibold text-white transition hover:bg-brand-primary-dark"
          >
            {t('select')}
          </button>
        ) : (
          <span
            title={t('premiumNote')}
            className="inline-flex h-9 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-border-default px-3 text-center text-[11px] font-semibold text-text-tertiary"
          >
            {t('premiumLocked')}
          </span>
        )}
      </div>
    </div>
  );
}
