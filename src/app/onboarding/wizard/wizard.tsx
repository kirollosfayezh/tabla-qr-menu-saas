'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ProgressBar } from './progress-bar';
import { PreviewPane } from './preview-pane';
import { StepBasics } from './step-basics';
import { StepBranding } from './step-branding';
import { StepTheme } from './step-theme';
import { StepDone } from './step-done';
import {
  EMPTY_DRAFT,
  STEP_ORDER,
  type RestaurantDraft,
  type StepKey,
  type ThemeOption,
} from './types';
import { createRestaurantAction } from '@/app/actions/onboarding.actions';
import { SLUG_MAX_LENGTH } from '@/config/constants';

interface Props {
  themes: ReadonlyArray<ThemeOption>;
  rootDomain: string;
}

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, '');
}

/** Top-level wizard orchestrator. Holds the draft + current step. */
export function Wizard({ themes, rootDomain }: Props): React.JSX.Element {
  const t = useTranslations('onboarding');
  const [step, setStep] = useState<StepKey>('basics');
  const [draft, setDraft] = useState<RestaurantDraft>(() => ({
    ...EMPTY_DRAFT,
    themeId: themes.find((th) => th.isFree)?.id ?? themes[0]?.id ?? '',
  }));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  const stepIndex = STEP_ORDER.indexOf(step);
  const onPatch = (patch: Partial<RestaurantDraft>): void =>
    setDraft((prev) => ({ ...prev, ...patch }));
  const go = (target: StepKey): void => setStep(target);
  const goBranding = (): void => {
    setDraft((prev) => (prev.slug ? prev : { ...prev, slug: slugFromName(prev.name) }));
    go('branding');
  };

  const selectedTheme = useMemo(
    () => themes.find((th) => th.id === draft.themeId),
    [themes, draft.themeId],
  );
  const pendingPayment = selectedTheme ? !selectedTheme.isFree : false;

  async function submit(): Promise<void> {
    setSubmitting(true);
    setSubmitError(undefined);
    const res = await createRestaurantAction(draft);
    setSubmitting(false);
    if (!res.ok) {
      setSubmitError(res.message || t('errors.createFailed'));
      return;
    }
    setCreatedUrl(`${res.value.slug}.${rootDomain}`);
    go('done');
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('stepLabel', { current: stepIndex + 1, total: STEP_ORDER.length })}
        </p>
        <h1 className="font-display text-3xl font-semibold text-text-primary">{t('title')}</h1>
        <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      </header>

      <ProgressBar current={step} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-sm">
          {step === 'basics' ? (
            <StepBasics draft={draft} onChange={onPatch} onNext={goBranding} />
          ) : null}
          {step === 'branding' ? (
            <StepBranding
              draft={draft}
              onChange={onPatch}
              onBack={() => go('basics')}
              onNext={() => go('theme')}
              rootDomain={rootDomain}
            />
          ) : null}
          {step === 'theme' ? (
            <StepTheme
              draft={draft}
              themes={themes}
              onChange={onPatch}
              onBack={() => go('branding')}
              onSubmit={submit}
              submitting={submitting}
              errorMessage={submitError}
            />
          ) : null}
          {step === 'done' && createdUrl ? (
            <StepDone url={createdUrl} pendingPayment={pendingPayment} />
          ) : null}
        </div>

        {step !== 'done' ? <PreviewPane draft={draft} rootDomain={rootDomain} /> : null}
      </div>
    </div>
  );
}
