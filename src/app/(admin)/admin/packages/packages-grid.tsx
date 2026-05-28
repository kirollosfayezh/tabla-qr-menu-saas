'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { Theme } from '@prisma/client';
import type { AdminPackageRow } from '@/repositories/admin/admin-theme.repository';
import { createPackageAction, deletePackageAction, updatePackageAction } from '@/app/actions/admin.actions';

interface FormState {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  priceCents: number;
  currencyCode: string;
  themeIds: string[];
  isActive: boolean;
}

const EMPTY: FormState = {
  id: '',
  name: '',
  nameAr: '',
  description: '',
  descriptionAr: '',
  priceCents: 0,
  currencyCode: 'EGP',
  themeIds: [],
  isActive: true,
};

export function PackagesGrid({
  packages,
  themes,
}: {
  packages: ReadonlyArray<AdminPackageRow>;
  themes: ReadonlyArray<Theme>;
}): React.JSX.Element {
  const t = useTranslations('admin.packages');
  const [editing, setEditing] = useState<FormState | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => setEditing({ ...EMPTY })} className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white">+ {t('newPackage')}</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {packages.map((pkg) => (
          <article key={pkg.id} className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
            <header className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-text-primary">{pkg.name}</h2>
                <p className="text-xs text-text-tertiary">{pkg.themes.length} {t('themesCount')}</p>
              </div>
              <span className={pkg.isActive ? 'inline-flex h-6 items-center rounded-[4px] bg-[#D1FAE5] px-2.5 text-xs font-semibold text-[#047857]' : 'inline-flex h-6 items-center rounded-[4px] bg-surface-sunken px-2.5 text-xs font-semibold text-text-tertiary'}>
                {pkg.isActive ? t('active') : t('inactive')}
              </span>
            </header>
            {pkg.description ? <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{pkg.description}</p> : null}
            <p className="mt-2 font-mono text-sm font-semibold text-text-primary">{(pkg.priceCents / 100).toFixed(2)} {pkg.currencyCode}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {pkg.themes.map(({ theme }) => (
                <li key={theme.id} className="rounded-full bg-surface-sunken px-2.5 py-0.5 text-xs text-text-secondary">{theme.name}</li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEditing({
                  id: pkg.id,
                  name: pkg.name,
                  nameAr: pkg.nameAr ?? '',
                  description: pkg.description ?? '',
                  descriptionAr: pkg.descriptionAr ?? '',
                  priceCents: pkg.priceCents,
                  currencyCode: pkg.currencyCode,
                  themeIds: pkg.themes.map((tr) => tr.theme.id),
                  isActive: pkg.isActive,
                })}
                className="rounded-full border border-border-default px-3 py-1 text-xs font-semibold"
              >{t('edit')}</button>
              <Delete id={pkg.id} label={t('delete')} />
            </div>
          </article>
        ))}
      </div>
      {editing ? <Dialog initial={editing} themes={themes} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}

function Delete({ id, label }: { id: string; label: string }): React.JSX.Element {
  const [pending, start] = useTransition();
  const [err, setErr] = useState('');
  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!window.confirm('Delete this package?')) return;
          start(async () => {
            const result = await deletePackageAction({ id });
            if (!result.ok) setErr(result.message);
          });
        }}
        className="rounded-full border border-danger px-3 py-1 text-xs font-semibold text-danger disabled:opacity-50"
      >{label}</button>
      {err ? <span className="text-xs text-danger">{err}</span> : null}
    </>
  );
}

function Dialog({
  initial,
  themes,
  onClose,
}: {
  initial: FormState;
  themes: ReadonlyArray<Theme>;
  onClose: () => void;
}): React.JSX.Element {
  const t = useTranslations('admin.packages');
  const [state, setState] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const isNew = !state.id;

  function toggleTheme(id: string): void {
    setState((prev) => ({
      ...prev,
      themeIds: prev.themeIds.includes(id) ? prev.themeIds.filter((x) => x !== id) : [...prev.themeIds, id],
    }));
  }

  function onSubmit(e: React.FormEvent): void {
    e.preventDefault();
    setErrors({});
    start(async () => {
      const body = {
        name: state.name,
        nameAr: state.nameAr,
        description: state.description,
        descriptionAr: state.descriptionAr,
        priceCents: state.priceCents,
        currencyCode: state.currencyCode,
        themeIds: state.themeIds,
        isActive: state.isActive,
      };
      const result = isNew ? await createPackageAction(body) : await updatePackageAction({ id: state.id, ...body });
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
        <h2 className="mb-4 font-display text-xl font-bold">{isNew ? t('newPackage') : t('editPackage')}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t('nameEn')} value={state.name} onChange={(v) => setState({ ...state, name: v })} error={errors.name} />
          <Field label={t('nameAr')} value={state.nameAr} onChange={(v) => setState({ ...state, nameAr: v })} error={errors.nameAr} dir="rtl" />
          <Field label={t('descEn')} value={state.description} onChange={(v) => setState({ ...state, description: v })} error={errors.description} />
          <Field label={t('descAr')} value={state.descriptionAr} onChange={(v) => setState({ ...state, descriptionAr: v })} error={errors.descriptionAr} dir="rtl" />
          <Field label={t('priceCents')} type="number" value={String(state.priceCents)} onChange={(v) => setState({ ...state, priceCents: Number(v) })} error={errors.priceCents} />
          <Field label={t('currency')} value={state.currencyCode} onChange={(v) => setState({ ...state, currencyCode: v.toUpperCase().slice(0, 3) })} error={errors.currencyCode} />
        </div>
        <fieldset className="mt-4">
          <legend className="mb-2 text-xs font-semibold text-text-primary">{t('themes')}</legend>
          <div className="grid gap-1 sm:grid-cols-2">
            {themes.map((theme) => (
              <label key={theme.id} className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={state.themeIds.includes(theme.id)} onChange={() => toggleTheme(theme.id)} />
                {theme.name}
              </label>
            ))}
          </div>
          {errors.themeIds ? <p className="mt-1 text-xs text-danger">{errors.themeIds}</p> : null}
        </fieldset>
        <label className="mt-3 inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={state.isActive} onChange={(e) => setState({ ...state, isActive: e.target.checked })} />
          {t('isActive')}
        </label>
        {errors._ ? <p className="mt-3 text-sm text-danger">{errors._}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border border-border-default px-5 py-2 text-sm font-semibold">{t('cancel')}</button>
          <button type="submit" disabled={pending} className="rounded-full bg-brand-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? '…' : t('save')}</button>
        </div>
      </form>
    </div>
  );
}

function Field({
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
