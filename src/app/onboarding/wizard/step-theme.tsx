'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ThemeCard } from '@/components/store/theme-card';
import { PreviewModal } from '@/components/store/preview-modal';
import { THEMES } from '@/components/store/store-data';
import { ThemeCardFooter } from './theme-card-footer';
import type { ThemeKey } from '@/components/store/store-data';
import type { RestaurantDraft, ThemeOption } from './types';

interface Props {
  draft: RestaurantDraft;
  themes: ReadonlyArray<ThemeOption>;
  onChange: (patch: Partial<RestaurantDraft>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  errorMessage?: string;
}

export function StepTheme(props: Props): React.JSX.Element {
  const { draft, themes, onChange, onBack, onSubmit, submitting, errorMessage } = props;
  const t = useTranslations('onboarding.themes');
  const tCommon = useTranslations('onboarding');
  const [preview, setPreview] = useState<ThemeKey | null>(null);

  // Only render themes we have a real renderer for (the canonical store themes),
  // so the gallery + live preview match the marketing page exactly.
  const options = themes.filter((theme) => theme.key in THEMES);
  const previewOption = preview ? options.find((option) => option.key === preview) : undefined;

  const selectTheme = (option: ThemeOption): void => {
    if (!option.isFree) return; // premium themes stay locked during setup
    onChange({ themeId: option.id });
    setPreview(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-text-primary">{t('title')}</h2>
        <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      </div>

      <p className="rounded-xl border border-border-subtle bg-surface-sunken px-4 py-3 text-xs text-text-secondary">
        {t('premiumNote')}
      </p>

      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {options.map((option) => {
          const key = option.key as ThemeKey;
          const selected = draft.themeId === option.id;
          return (
            <li
              key={option.id}
              className={selected ? 'rounded-[18px] ring-2 ring-brand-primary' : undefined}
            >
              <ThemeCard
                themeKey={key}
                isCurrent={false}
                onPreview={() => setPreview(key)}
                footer={
                  <ThemeCardFooter
                    option={option}
                    selected={selected}
                    onPreview={() => setPreview(key)}
                    onSelect={() => selectTheme(option)}
                  />
                }
              />
            </li>
          );
        })}
      </ul>

      {errorMessage ? (
        <p role="alert" className="text-sm text-danger">{errorMessage}</p>
      ) : null}

      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack} disabled={submitting}>
          {tCommon('back')}
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          loading={submitting}
          disabled={!draft.themeId || submitting}
        >
          {submitting ? tCommon('submitting') : tCommon('submit')}
        </Button>
      </div>

      {previewOption ? (
        <PreviewModal
          themeKey={previewOption.key as ThemeKey}
          isCurrent={draft.themeId === previewOption.id}
          saving={false}
          chooseLabel={previewOption.isFree ? t('selectThis') : t('premiumLocked')}
          chooseDisabled={!previewOption.isFree}
          onClose={() => setPreview(null)}
          onChoose={() => selectTheme(previewOption)}
        />
      ) : null}
    </div>
  );
}
