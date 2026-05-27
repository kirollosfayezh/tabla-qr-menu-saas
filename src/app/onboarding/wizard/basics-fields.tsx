'use client';

import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import type { RestaurantDraft } from './types';

interface Props {
  draft: RestaurantDraft;
  errors: Record<string, string>;
  onChange: (patch: Partial<RestaurantDraft>) => void;
}

/** The bilingual name + description + WhatsApp fields shared by step 1. */
export function BasicsTextFields({ draft, errors, onChange }: Props): React.JSX.Element {
  const t = useTranslations('onboarding.basics');
  return (
    <>
      <Field label={t('name')} htmlFor="r-name" error={errors.name}>
        <Input
          id="r-name"
          value={draft.name}
          placeholder={t('namePlaceholder')}
          onChange={(e) => onChange({ name: e.target.value })}
          invalid={Boolean(errors.name)}
          autoFocus
        />
      </Field>
      <Field label={t('nameAr')} htmlFor="r-name-ar" error={errors.nameAr}>
        <Input
          id="r-name-ar"
          value={draft.nameAr}
          dir="rtl"
          onChange={(e) => onChange({ nameAr: e.target.value })}
          invalid={Boolean(errors.nameAr)}
        />
      </Field>
      <Field label={t('description')} htmlFor="r-desc" error={errors.description}>
        <Input
          id="r-desc"
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
      <Field label={t('descriptionAr')} htmlFor="r-desc-ar" error={errors.descriptionAr}>
        <Input
          id="r-desc-ar"
          value={draft.descriptionAr}
          dir="rtl"
          onChange={(e) => onChange({ descriptionAr: e.target.value })}
        />
      </Field>
      <Field
        label={t('whatsapp')}
        htmlFor="r-wa"
        hint={t('whatsappHint')}
        error={errors.whatsappNumber}
      >
        <Input
          id="r-wa"
          value={draft.whatsappNumber}
          inputMode="tel"
          placeholder="+201234567890"
          onChange={(e) => onChange({ whatsappNumber: e.target.value })}
          invalid={Boolean(errors.whatsappNumber)}
        />
      </Field>
    </>
  );
}
