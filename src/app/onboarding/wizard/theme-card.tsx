'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { ThemePreview } from '@/components/theme/theme-preview';
import type { ThemeOption } from './types';

interface Props {
  theme: ThemeOption;
  selected: boolean;
  onPick: () => void;
}

/** One theme tile in the Step 3 picker. */
export function ThemeCard({ theme, selected, onPick }: Props): React.JSX.Element {
  const t = useTranslations('onboarding.themes');
  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        'flex w-full flex-col overflow-hidden rounded-2xl border bg-surface-base text-start transition',
        selected
          ? 'border-brand-primary ring-2 ring-brand-primary'
          : 'border-border-default hover:border-border-strong',
      )}
    >
      <ThemePreview themeKey={theme.key} height={220} />
      <div className="flex w-full flex-col gap-1.5 p-4">
        <div className="flex w-full items-center justify-between">
          <span className="font-display text-lg font-semibold text-text-primary">{theme.name}</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[11px] font-medium',
              theme.isFree ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
            )}
          >
            {theme.isFree ? t('free') : t('paid')}
          </span>
        </div>
        {theme.description ? (
          <p className="text-xs text-text-secondary">{theme.description}</p>
        ) : null}
        {selected ? (
          <span className="text-[11px] font-semibold text-brand-primary">{t('selected')}</span>
        ) : null}
      </div>
    </button>
  );
}
