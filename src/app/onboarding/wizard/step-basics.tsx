'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RestaurantBasicsSchema } from '@/dtos/restaurant.dto';
import type { RestaurantDraft } from './types';
import { BasicsTextFields } from './basics-fields';

interface Props {
  draft: RestaurantDraft;
  onChange: (patch: Partial<RestaurantDraft>) => void;
  onNext: () => void;
}

function flattenErrors(issues: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, msgs] of Object.entries(issues)) {
    if (msgs && msgs[0]) out[k] = msgs[0];
  }
  return out;
}

export function StepBasics({ draft, onChange, onNext }: Props): React.JSX.Element {
  const t = useTranslations('onboarding.basics');
  const tCommon = useTranslations('onboarding');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent): void {
    e.preventDefault();
    const parsed = RestaurantBasicsSchema.safeParse(draft);
    if (!parsed.success) {
      setErrors(flattenErrors(parsed.error.flatten().fieldErrors));
      return;
    }
    setErrors({});
    onNext();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <h2 className="font-display text-2xl font-semibold text-text-primary">{t('title')}</h2>
      <BasicsTextFields draft={draft} onChange={onChange} errors={errors} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('currency')} htmlFor="r-cur" hint={t('currencyHint')} error={errors.currencyCode}>
          <Input
            id="r-cur"
            value={draft.currencyCode}
            maxLength={3}
            onChange={(e) => onChange({ currencyCode: e.target.value.toUpperCase() })}
            invalid={Boolean(errors.currencyCode)}
          />
        </Field>
        <Field label={t('defaultLocale')} htmlFor="r-loc" error={errors.defaultLocale}>
          <select
            id="r-loc"
            value={draft.defaultLocale}
            onChange={(e) => onChange({ defaultLocale: e.target.value as 'en' | 'ar' })}
            className="block h-11 w-full rounded-lg border border-border-default bg-surface-base px-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
          >
            <option value="en">{t('localeEn')}</option>
            <option value="ar">{t('localeAr')}</option>
          </select>
        </Field>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit">{tCommon('next')}</Button>
      </div>
    </form>
  );
}
