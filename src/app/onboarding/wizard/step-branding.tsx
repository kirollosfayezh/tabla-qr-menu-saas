'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RestaurantBrandingSchema } from '@/dtos/restaurant.dto';
import type { RestaurantDraft } from './types';
import { useSlugCheck, type SlugStatus } from './use-slug-check';
import { ColorField } from './color-field';
import { cn } from '@/lib/cn';

interface Props {
  draft: RestaurantDraft;
  onChange: (patch: Partial<RestaurantDraft>) => void;
  onBack: () => void;
  onNext: () => void;
  rootDomain: string;
}

const STATUS_TONE: Record<SlugStatus, string> = {
  idle: 'text-text-tertiary',
  checking: 'text-text-tertiary',
  available: 'text-success',
  taken: 'text-danger',
  reserved: 'text-danger',
  invalid: 'text-danger',
};

function slugMessage(status: SlugStatus, t: (k: string) => string): string {
  switch (status) {
    case 'checking':
      return t('slugChecking');
    case 'available':
      return t('slugAvailable');
    case 'taken':
      return t('slugTaken');
    case 'reserved':
      return t('slugReserved');
    default:
      return '';
  }
}

export function StepBranding(props: Props): React.JSX.Element {
  const { draft, onChange, onBack, onNext, rootDomain } = props;
  const t = useTranslations('onboarding.branding');
  const tCommon = useTranslations('onboarding');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const slugStatus = useSlugCheck(draft.slug);

  function submit(e: React.FormEvent): void {
    e.preventDefault();
    const parsed = RestaurantBrandingSchema.safeParse(draft);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const [k, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
        if (msgs?.[0]) next[k] = msgs[0];
      }
      setErrors(next);
      return;
    }
    if (slugStatus !== 'available') {
      const key = slugStatus === 'taken' ? 'slugTaken' : 'slugReserved';
      setErrors({ slug: t(key) });
      return;
    }
    setErrors({});
    onNext();
  }

  const slugMsg = slugMessage(slugStatus, t);
  const url = `${draft.slug || 'you'}.${rootDomain}`;
  const slugInvalid =
    Boolean(errors.slug) || ['taken', 'reserved', 'invalid'].includes(slugStatus);

  return (
    <form onSubmit={submit} className="space-y-5">
      <h2 className="font-display text-2xl font-semibold text-text-primary">{t('title')}</h2>
      <Field label={t('slug')} htmlFor="r-slug" error={errors.slug} hint={t('slugHint')}>
        <Input
          id="r-slug"
          value={draft.slug}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onChange({ slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
          invalid={slugInvalid}
        />
        <p className="mt-1 text-xs text-text-tertiary">{t('slugPreview', { url })}</p>
        {slugMsg ? (
          <p className={cn('text-xs font-medium', STATUS_TONE[slugStatus])}>{slugMsg}</p>
        ) : null}
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <ColorField id="primary" label={t('primaryColor')} value={draft.primaryColor} onChange={(v) => onChange({ primaryColor: v })} error={errors.primaryColor} />
        <ColorField id="secondary" label={t('secondaryColor')} value={draft.secondaryColor} onChange={(v) => onChange({ secondaryColor: v })} error={errors.secondaryColor} />
        <ColorField id="accent" label={t('accentColor')} value={draft.accentColor} onChange={(v) => onChange({ accentColor: v })} error={errors.accentColor} />
      </div>
      <div className="flex justify-between pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>{tCommon('back')}</Button>
        <Button type="submit">{tCommon('next')}</Button>
      </div>
    </form>
  );
}
