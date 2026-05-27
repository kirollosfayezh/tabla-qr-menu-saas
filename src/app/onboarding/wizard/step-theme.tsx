'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ThemeCard } from './theme-card';
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

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-text-primary">{t('title')}</h2>
        <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      </div>

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {themes.map((theme) => (
          <li key={theme.id}>
            <ThemeCard
              theme={theme}
              selected={draft.themeId === theme.id}
              onPick={() => onChange({ themeId: theme.id })}
            />
          </li>
        ))}
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
    </div>
  );
}
