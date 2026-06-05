'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { createThemeAction, updateThemeAction } from '@/app/actions/admin.actions';
import { ThemeDesignFields } from './theme-design-fields';
import type { ThemeDesign } from '@/dtos/theme-design.dto';

export interface FormState {
  id: string;
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  previewImageUrl: string;
  isFree: boolean;
  priceCents: number;
  isActive: boolean;
  sortOrder: number;
  design: ThemeDesign;
}

/** Create/edit dialog for a theme, including its visual design tokens. */
export function ThemeDialog({ initial, onClose }: { initial: FormState; onClose: () => void }): React.JSX.Element {
  const t = useTranslations('admin.themes');
  const [state, setState] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const isNew = !state.id;

  function onSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setErrors({});
    start(async () => {
      const payload = {
        key: state.key,
        name: state.name,
        nameAr: state.nameAr,
        description: state.description,
        descriptionAr: state.descriptionAr,
        previewImageUrl: state.previewImageUrl,
        isFree: state.isFree,
        priceCents: state.priceCents,
        isActive: state.isActive,
        sortOrder: state.sortOrder,
        design: state.design,
      };
      const result = isNew ? await createThemeAction(payload) : await updateThemeAction({ id: state.id, ...payload });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? { _: result.message });
        return;
      }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface-base p-6 shadow-2xl">
        <h2 className="mb-4 font-display text-xl font-bold">{isNew ? t('newTheme') : t('editTheme')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label={t('key')} value={state.key} onChange={(v) => setState({ ...state, key: v })} error={errors.key} />
          <Input label={t('sortOrder')} type="number" value={String(state.sortOrder)} onChange={(v) => setState({ ...state, sortOrder: Number(v) })} error={errors.sortOrder} />
          <Input label={t('nameEn')} value={state.name} onChange={(v) => setState({ ...state, name: v })} error={errors.name} />
          <Input label={t('nameAr')} value={state.nameAr} onChange={(v) => setState({ ...state, nameAr: v })} error={errors.nameAr} dir="rtl" />
          <Input label={t('descEn')} value={state.description} onChange={(v) => setState({ ...state, description: v })} error={errors.description} />
          <Input label={t('descAr')} value={state.descriptionAr} onChange={(v) => setState({ ...state, descriptionAr: v })} error={errors.descriptionAr} dir="rtl" />
          <Input label={t('previewUrl')} value={state.previewImageUrl} onChange={(v) => setState({ ...state, previewImageUrl: v })} error={errors.previewImageUrl} />
          <Input label={t('priceCents')} type="number" value={String(state.priceCents)} onChange={(v) => setState({ ...state, priceCents: Number(v) })} error={errors.priceCents} />
        </div>
        <div className="mt-3 flex flex-wrap gap-4">
          <Toggle label={t('isFree')} value={state.isFree} onChange={(v) => setState({ ...state, isFree: v })} />
          <Toggle label={t('isActive')} value={state.isActive} onChange={(v) => setState({ ...state, isActive: v })} />
        </div>
        <ThemeDesignFields value={state.design} onChange={(design) => setState({ ...state, design })} />
        {errors._ ? <p className="mt-3 text-sm text-danger">{errors._}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-border-default px-5 py-2 text-sm font-semibold">{t('cancel')}</button>
          <button type="submit" disabled={pending} className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? '…' : t('save')}</button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, error, type = 'text', dir }: {
  label: string; value: string; onChange: (v: string) => void; error?: string; type?: string; dir?: 'rtl';
}): React.JSX.Element {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-text-primary">{label}</span>
      <input
        type={type}
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-border-default bg-surface-base px-3 text-sm outline-none focus:border-brand-primary"
      />
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }): React.JSX.Element {
  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
