'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { Theme } from '@prisma/client';
import { createThemeAction, deleteThemeAction, updateThemeAction } from '@/app/actions/admin.actions';

interface FormState {
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
}

const EMPTY: FormState = {
  id: '',
  key: '',
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  previewImageUrl: '',
  isFree: true,
  priceCents: 0,
  isActive: true,
  sortOrder: 0,
};

function toFormState(theme: Theme): FormState {
  return {
    id: theme.id,
    key: theme.key,
    name: theme.name,
    nameAr: theme.nameAr ?? '',
    description: theme.description ?? '',
    descriptionAr: theme.descriptionAr ?? '',
    previewImageUrl: theme.previewImageUrl ?? '',
    isFree: theme.isFree,
    priceCents: theme.priceCents,
    isActive: theme.isActive,
    sortOrder: theme.sortOrder,
  };
}

export function ThemesGrid({ themes }: { themes: ReadonlyArray<Theme> }): React.JSX.Element {
  const t = useTranslations('admin.themes');
  const [editing, setEditing] = useState<FormState | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => setEditing({ ...EMPTY })} className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white">
          + {t('newTheme')}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {themes.map((theme) => (
          <article key={theme.id} className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-text-primary">{theme.name}</h2>
                <p className="font-mono text-xs text-text-tertiary">{theme.key}</p>
              </div>
              <Pill on={theme.isActive} onLabel={t('active')} offLabel={t('inactive')} />
            </div>
            {theme.description ? <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{theme.description}</p> : null}
            <p className="mt-3 text-sm font-semibold text-text-primary">
              {theme.isFree ? t('free') : `${(theme.priceCents / 100).toFixed(2)} EGP`}
            </p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setEditing(toFormState(theme))} className="rounded-full border border-border-default px-3 py-1 text-xs font-semibold">{t('edit')}</button>
              <DeleteButton id={theme.id} label={t('delete')} />
            </div>
          </article>
        ))}
      </div>

      {editing ? (
        <ThemeDialog initial={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}

function Pill({ on, onLabel, offLabel }: { on: boolean; onLabel: string; offLabel: string }): React.JSX.Element {
  return (
    <span className={on ? 'inline-flex h-6 items-center rounded-[4px] bg-[#D1FAE5] px-2.5 text-xs font-semibold text-[#047857]' : 'inline-flex h-6 items-center rounded-[4px] bg-surface-sunken px-2.5 text-xs font-semibold text-text-tertiary'}>
      {on ? onLabel : offLabel}
    </span>
  );
}

function DeleteButton({ id, label }: { id: string; label: string }): React.JSX.Element {
  const [pending, start] = useTransition();
  const [err, setErr] = useState('');
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm('Delete this theme?')) return;
          setErr('');
          start(async () => {
            const result = await deleteThemeAction({ id });
            if (!result.ok) setErr(result.message);
          });
        }}
        className="rounded-full border border-danger px-3 py-1 text-xs font-semibold text-danger disabled:opacity-50"
      >
        {label}
      </button>
      {err ? <span className="text-xs text-danger">{err}</span> : null}
    </>
  );
}

function ThemeDialog({ initial, onClose }: { initial: FormState; onClose: () => void }): React.JSX.Element {
  const t = useTranslations('admin.themes');
  const [state, setState] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const isNew = !state.id;

  function onSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setErrors({});
    start(async () => {
      const result = isNew
        ? await createThemeAction({
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
          })
        : await updateThemeAction({
            id: state.id,
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
          });
      if (!result.ok) {
        setErrors(result.fieldErrors ?? { _: result.message });
        return;
      }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-2xl rounded-2xl bg-surface-base p-6 shadow-2xl">
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
        {errors._ ? <p className="mt-3 text-sm text-danger">{errors._}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-border-default px-5 py-2 text-sm font-semibold">{t('cancel')}</button>
          <button type="submit" disabled={pending} className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? '…' : t('save')}</button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  error,
  type = 'text',
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
  dir?: 'rtl';
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
