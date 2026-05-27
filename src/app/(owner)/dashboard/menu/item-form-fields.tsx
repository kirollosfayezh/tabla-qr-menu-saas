'use client';

import { useTranslations } from 'next-intl';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { TagsInput } from './tags-input';
import { parsePriceInput } from './format';
import type { ItemDraft } from './types';

interface Props {
  draft: ItemDraft;
  priceText: string;
  errors: Record<string, string>;
  onChange: (patch: Partial<ItemDraft>) => void;
  onPriceTextChange: (text: string) => void;
}

/** Bilingual name/desc + price + availability + tags + allergens fields shared by the modal. */
export function ItemFormFields(props: Props): React.JSX.Element {
  const { draft, priceText, errors, onChange, onPriceTextChange } = props;
  const t = useTranslations('owner.menu.form');

  function commitPrice(): void {
    const cents = parsePriceInput(priceText);
    if (!Number.isNaN(cents)) onChange({ priceCents: cents });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label={t('name')} htmlFor="i-name" error={errors.name}>
        <Input id="i-name" value={draft.name} onChange={(e) => onChange({ name: e.target.value })} invalid={Boolean(errors.name)} autoFocus />
      </Field>
      <Field label={t('nameAr')} htmlFor="i-name-ar" error={errors.nameAr}>
        <Input id="i-name-ar" dir="rtl" value={draft.nameAr} onChange={(e) => onChange({ nameAr: e.target.value })} invalid={Boolean(errors.nameAr)} />
      </Field>
      <Field label={t('description')} htmlFor="i-desc" error={errors.description}>
        <Input id="i-desc" value={draft.description} onChange={(e) => onChange({ description: e.target.value })} />
      </Field>
      <Field label={t('descriptionAr')} htmlFor="i-desc-ar" error={errors.descriptionAr}>
        <Input id="i-desc-ar" dir="rtl" value={draft.descriptionAr} onChange={(e) => onChange({ descriptionAr: e.target.value })} />
      </Field>
      <Field label={t('price')} htmlFor="i-price" error={errors.priceCents} hint={t('priceHint')}>
        <Input
          id="i-price"
          inputMode="decimal"
          value={priceText}
          onChange={(e) => onPriceTextChange(e.target.value)}
          onBlur={commitPrice}
          invalid={Boolean(errors.priceCents)}
        />
      </Field>
      <Field label={t('availability')} htmlFor="i-avail">
        <label className="flex h-11 items-center gap-2 rounded-lg border border-border-default bg-surface-base px-3 text-sm">
          <input
            id="i-avail"
            type="checkbox"
            checked={draft.isAvailable}
            onChange={(e) => onChange({ isAvailable: e.target.checked })}
            className="h-4 w-4 accent-brand-primary"
          />
          <span className="text-text-primary">{draft.isAvailable ? t('availability') : t('availability')}</span>
        </label>
      </Field>
      <Field label={t('tags')} htmlFor="i-tags">
        <TagsInput id="i-tags" values={draft.tags} placeholder={t('tagsPlaceholder')} onChange={(v) => onChange({ tags: v })} />
      </Field>
      <Field label={t('allergens')} htmlFor="i-aller">
        <TagsInput id="i-aller" values={draft.allergens} placeholder={t('allergensPlaceholder')} onChange={(v) => onChange({ allergens: v })} />
      </Field>
    </div>
  );
}
