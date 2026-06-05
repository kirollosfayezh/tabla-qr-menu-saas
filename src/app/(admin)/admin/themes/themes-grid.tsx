'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { Theme } from '@prisma/client';
import { deleteThemeAction } from '@/app/actions/admin.actions';
import { DEFAULT_THEME_DESIGN, parseThemeDesign } from '@/dtos/theme-design.dto';
import { ThemeDialog } from './theme-dialog';
import type { FormState } from './theme-dialog';

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
  design: DEFAULT_THEME_DESIGN,
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
    design: parseThemeDesign(theme.design),
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

