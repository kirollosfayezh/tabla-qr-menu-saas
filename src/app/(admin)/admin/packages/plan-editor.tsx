'use client';

/* eslint-disable max-lines, max-lines-per-function */

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { AdminPlanRow } from '@/repositories/admin/admin-plan.repository';
import type { Theme } from '@prisma/client';
import { updatePlanAction, createPlanAction } from '@/app/actions/plan.actions';
import { cn } from '@/lib/cn';

interface Props {
  plans: AdminPlanRow[];
  themes: Theme[];
}

/** Admin control panel: edit existing plans + create new ones. */
export function PlanEditor({ plans: initial, themes }: Props): React.JSX.Element {
  const t = useTranslations('admin.plans');
  const [plans, setPlans] = useState(initial);
  const [showNew, setShowNew] = useState(false);

  function onCreated(key: string, name: string, nameAr: string, maxItems: number, maxCategories: number): void {
    setPlans((prev) => [...prev, {
      key, name, nameAr, maxItems, maxCategories,
      monthlyPriceCents: 0, yearlyPriceCents: 0,
      sortOrder: prev.length + 1, isActive: true,
      createdAt: new Date(), updatedAt: new Date(),
      accessibleThemes: [],
    }]);
    setShowNew(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {!showNew && (
          <button
            type="button"
            onClick={() => setShowNew(true)}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-brand-primary px-4 text-sm font-semibold text-white transition hover:bg-brand-primary-dark"
          >
            {t('newPlan')}
          </button>
        )}
      </div>

      {showNew && (
        <NewPlanCard
          allThemes={themes}
          onCreated={onCreated}
          onCancel={() => setShowNew(false)}
        />
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.key} plan={plan} allThemes={themes} />
        ))}
      </div>
    </div>
  );
}

/* ─── Edit existing plan card ──────────────────────────────────────────────── */

function PlanCard({ plan, allThemes }: { plan: AdminPlanRow; allThemes: Theme[] }): React.JSX.Element {
  const t = useTranslations('admin.plans');
  const [maxItems,  setMaxItems]  = useState(String(plan.maxItems));
  const [maxCats,   setMaxCats]   = useState(String(plan.maxCategories));
  const [monthly,   setMonthly]   = useState(String(Math.round(plan.monthlyPriceCents / 100)));
  const [yearly,    setYearly]    = useState(String(Math.round(plan.yearlyPriceCents / 100)));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(plan.accessibleThemes.map((pt) => pt.themeId)),
  );
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState('');
  const [pending, start]    = useTransition();

  function toggle(id: string): void {
    setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setSaved(false);
  }

  function save(): void {
    setError(''); setSaved(false);
    start(async () => {
      const r = await updatePlanAction({
        key: plan.key,
        maxItems: Number(maxItems),
        maxCategories: Number(maxCats),
        monthlyPriceCents: Math.round(Number(monthly) * 100),
        yearlyPriceCents:  Math.round(Number(yearly)  * 100),
        themeIds: [...selectedIds],
      });
      if (!r.ok) { setError(r.message); return; }
      setSaved(true);
    });
  }

  const accent = plan.key === 'free_trial' ? 'border-warning/40 bg-warning/5'
    : plan.key === 'studio' ? 'border-brand-primary/40 bg-brand-primary-soft/30'
    : 'border-success/40 bg-success/5';

  return (
    <div className={cn('rounded-2xl border-2 p-5 shadow-sm', accent)}>
      <div className="mb-4">
        <h2 className="font-display text-xl font-bold text-text-primary">{plan.name}</h2>
        {plan.nameAr && <p className="text-sm text-text-tertiary">{plan.nameAr}</p>}
        <code className="mt-0.5 block text-[11px] text-text-tertiary">{plan.key}</code>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <LimitField label={t('maxItems')}      value={maxItems} onChange={(v) => { setMaxItems(v); setSaved(false); }} />
        <LimitField label={t('maxCategories')} value={maxCats}  onChange={(v) => { setMaxCats(v);  setSaved(false); }} />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <PriceField label={t('monthlyPrice')} value={monthly} onChange={(v) => { setMonthly(v); setSaved(false); }} />
        <PriceField label={t('yearlyPrice')}  value={yearly}  onChange={(v) => { setYearly(v);  setSaved(false); }} />
      </div>
      <ThemeCheckboxes allThemes={allThemes} selectedIds={selectedIds} onToggle={toggle} />
      {error && <p className="mb-2 text-xs text-danger">{error}</p>}
      <SaveButton pending={pending} saved={saved} label={t('save')} savingLabel={t('saving')} savedLabel={t('saved')} onClick={save} />
    </div>
  );
}

/* ─── Create new plan card ─────────────────────────────────────────────────── */

interface NewPlanCardProps {
  allThemes: Theme[];
  onCreated: (key: string, name: string, nameAr: string, maxItems: number, maxCategories: number) => void;
  onCancel: () => void;
}

function NewPlanCard({ allThemes, onCreated, onCancel }: NewPlanCardProps): React.JSX.Element {
  const t = useTranslations('admin.plans');
  const [key,      setKey]      = useState('');
  const [name,     setName]     = useState('');
  const [nameAr,   setNameAr]   = useState('');
  const [maxItems, setMaxItems] = useState('30');
  const [maxCats,  setMaxCats]  = useState('10');
  const [monthly,  setMonthly]  = useState('0');
  const [yearly,   setYearly]   = useState('0');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error,    setError]    = useState('');
  const [pending,  start]       = useTransition();

  const keyInvalid = key.length > 0 && !/^[a-z0-9_]+$/.test(key);

  function toggle(id: string): void {
    setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function create(): void {
    setError('');
    start(async () => {
      const r = await createPlanAction({ key, name, nameAr, maxItems: Number(maxItems), maxCategories: Number(maxCats), monthlyPriceCents: Math.round(Number(monthly) * 100), yearlyPriceCents: Math.round(Number(yearly) * 100), themeIds: [...selectedIds] });
      if (!r.ok) { setError(r.message); return; }
      onCreated(key, name, nameAr, Number(maxItems), Number(maxCats));
    });
  }

  return (
    <div className="rounded-2xl border-2 border-dashed border-brand-primary/40 bg-brand-primary-soft/10 p-5">
      <h2 className="mb-4 font-display text-xl font-bold text-text-primary">{t('createPlan')}</h2>

      <div className="mb-3 space-y-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-text-secondary">{t('planKey')}</label>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            placeholder="e.g. pro_plus"
            className={cn('w-full rounded-lg border px-3 py-2 text-sm font-mono', keyInvalid ? 'border-danger' : 'border-border-default')}
          />
          <p className="mt-1 text-[11px] text-text-tertiary">{keyInvalid ? t('planKeyError') : t('planKeyHint')}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">{t('nameEn')}</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border-default px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">{t('nameAr')}</label>
            <input value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" className="w-full rounded-lg border border-border-default px-3 py-2 text-sm" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <LimitField label={t('maxItems')}      value={maxItems} onChange={setMaxItems} />
          <LimitField label={t('maxCategories')} value={maxCats}  onChange={setMaxCats}  />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <PriceField label={t('monthlyPrice')} value={monthly} onChange={setMonthly} />
          <PriceField label={t('yearlyPrice')}  value={yearly}  onChange={setYearly}  />
        </div>
      </div>

      <ThemeCheckboxes allThemes={allThemes} selectedIds={selectedIds} onToggle={toggle} />

      {error && <p className="mb-2 text-xs text-danger">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border-default py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-surface-raised"
        >
          {t('cancelCreate')}
        </button>
        <SaveButton
          pending={pending}
          saved={false}
          label={t('createPlan')}
          savingLabel={t('creating')}
          savedLabel={t('createPlan')}
          onClick={create}
          disabled={!key || !name || keyInvalid}
          className="flex-1"
        />
      </div>
    </div>
  );
}

/* ─── Shared sub-components ────────────────────────────────────────────────── */

function ThemeCheckboxes({ allThemes, selectedIds, onToggle }: { allThemes: Theme[]; selectedIds: Set<string>; onToggle: (id: string) => void }): React.JSX.Element {
  const t = useTranslations('admin.plans');
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">{t('accessibleThemes')}</p>
      <div className="flex flex-col gap-1.5">
        {allThemes.map((theme) => (
          <label key={theme.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-raised">
            <input
              type="checkbox"
              checked={selectedIds.has(theme.id)}
              onChange={() => onToggle(theme.id)}
              className="h-4 w-4 rounded accent-brand-primary"
            />
            <span className="text-sm font-medium text-text-primary">{theme.name}</span>
            {theme.nameAr && <span className="text-xs text-text-tertiary">{theme.nameAr}</span>}
            {theme.isFree && <span className="ms-auto text-[10px] font-bold uppercase text-success">Free</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

function LimitField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }): React.JSX.Element {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-text-secondary">{label}</label>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm font-mono"
      />
    </div>
  );
}

function PriceField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }): React.JSX.Element {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-text-secondary">{label}</label>
      <div className="flex items-center overflow-hidden rounded-lg border border-border-default bg-surface-base">
        <span className="border-e border-border-default bg-surface-sunken px-2.5 py-2 text-xs font-semibold text-text-tertiary">EGP</span>
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-3 py-2 text-sm font-mono outline-none"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function SaveButton({ pending, saved, label, savingLabel, savedLabel, onClick, disabled = false, className }: {
  pending: boolean; saved: boolean; label: string; savingLabel: string; savedLabel: string;
  onClick: () => void; disabled?: boolean; className?: string;
}): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={pending || disabled}
      onClick={onClick}
      className={cn(
        'rounded-xl py-2.5 text-sm font-semibold transition disabled:opacity-50',
        saved ? 'bg-success/10 text-success' : 'bg-brand-primary text-white hover:bg-brand-primary-dark',
        className,
      )}
    >
      {pending ? savingLabel : saved ? `✓ ${savedLabel}` : label}
    </button>
  );
}
