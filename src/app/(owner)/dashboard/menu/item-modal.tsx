'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { listItemOptionsAction } from '@/app/actions/menu.actions';
import { ItemFormFields } from './item-form-fields';
import { ItemImageUploader, deleteUploadedImage } from './item-image-uploader';
import { ItemOptionsEditor } from './item-options-editor';
import { emptyItemDraft, type ItemDraft, type ItemView } from './types';
import { formatPrice } from './format';
import { applyPriceText, validateItem } from './item-validation';

interface Props {
  categoryId: string;
  currencyCode: string;
  locale: string;
  /** Restaurant's default menu locale — drives the "Arabic name required" rule. */
  defaultLocale: 'en' | 'ar';
  initial?: ItemView | null;
  /** Resolves true if the save succeeded, false if it failed (modal stays open). */
  onSave: (draft: ItemDraft, id: string | null) => Promise<boolean>;
  onCancel: () => void;
  onError: (message: string) => void;
}

function viewToDraft(view: ItemView): ItemDraft {
  return {
    categoryId: view.categoryId,
    name: view.name,
    nameAr: view.nameAr ?? '',
    description: view.description ?? '',
    descriptionAr: view.descriptionAr ?? '',
    priceCents: view.priceCents,
    imageUrl: view.imageUrl ?? '',
    isAvailable: view.isAvailable,
    tags: [...view.tags],
    allergens: [...view.allergens],
    optionGroups: [],
  };
}

export function ItemModal(props: Props): React.JSX.Element | null {
  const { categoryId, currencyCode, locale, defaultLocale, initial, onCancel, onSave, onError } =
    props;
  const t = useTranslations('owner.menu');
  const tForm = useTranslations('owner.menu.form');
  const tErr = useTranslations('owner.menu.errors');
  const baselineUrl = initial?.imageUrl ?? '';
  const [draft, setDraft] = useState<ItemDraft>(() =>
    initial ? viewToDraft(initial) : emptyItemDraft(categoryId),
  );
  const [priceText, setPriceText] = useState<string>(() =>
    initial ? (initial.priceCents / 100).toString() : '',
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const target = typeof document === 'undefined' ? null : document.body;

  function cancel(): void {
    // Drop any image uploaded during this session that wasn't saved.
    if (draft.imageUrl && draft.imageUrl !== baselineUrl) {
      void deleteUploadedImage(draft.imageUrl);
    }
    onCancel();
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape' && !saving) cancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saving, draft.imageUrl, baselineUrl]);

  useEffect(() => {
    if (!initial?.id) return;
    let cancelled = false;
    void listItemOptionsAction(initial.id).then((result) => {
      if (cancelled || !result.ok) return;
      setDraft((current) => ({
        ...current,
        optionGroups: result.value.groups.map((group) => ({
          id: group.id,
          name: group.name,
          nameAr: group.nameAr ?? '',
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          required: group.required,
          sortOrder: group.sortOrder,
          options: group.options.map((option) => ({
            id: option.id,
            label: option.label,
            labelAr: option.labelAr ?? '',
            priceDeltaCents: option.priceDeltaCents,
            sortOrder: option.sortOrder,
          })),
        })),
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [initial?.id]);

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const candidate = applyPriceText(draft, priceText);
    setDraft(candidate);
    const found = validateItem(candidate, defaultLocale, tErr);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const ok = await onSave(candidate, initial?.id ?? null);
      if (!ok && candidate.imageUrl && candidate.imageUrl !== baselineUrl) {
        // Save failed → clean up the orphan we uploaded this session.
        void deleteUploadedImage(candidate.imageUrl);
        setDraft((d) => ({ ...d, imageUrl: baselineUrl }));
      }
    } finally {
      setSaving(false);
    }
  }

  if (!target) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:px-4">
      <button type="button" aria-label="Close" onClick={() => !saving && cancel()} className="absolute inset-0 bg-[rgba(15,15,26,0.55)]" />
      <form onSubmit={submit} className="relative z-[71] flex max-h-[92vh] w-full max-w-3xl flex-col gap-5 overflow-y-auto rounded-t-2xl bg-surface-base p-6 shadow-2xl sm:rounded-2xl">
        <header className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-text-primary">
            {initial ? t('editItem') : t('newItem')}
          </h2>
          {draft.priceCents > 0 ? (
            <span className="text-sm font-medium text-text-secondary">
              {formatPrice(draft.priceCents, currencyCode, locale)}
            </span>
          ) : null}
        </header>

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-text-primary">{tForm('image')}</span>
          <ItemImageUploader
            scope="item"
            value={draft.imageUrl}
            baselineUrl={baselineUrl}
            onChange={(url) => setDraft((d) => ({ ...d, imageUrl: url }))}
            onError={onError}
          />
        </div>

        <ItemFormFields draft={draft} priceText={priceText} errors={errors} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} onPriceTextChange={setPriceText} />

        <ItemOptionsEditor
          groups={draft.optionGroups}
          currencyCode={currencyCode}
          onChange={(optionGroups) => setDraft((d) => ({ ...d, optionGroups }))}
        />

        <footer className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={cancel} disabled={saving}>
            {tForm('cancel')}
          </Button>
          <Button type="submit" loading={saving}>
            {saving ? tForm('saving') : tForm('save')}
          </Button>
        </footer>
      </form>
    </div>,
    target,
  );
}
