'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { parsePriceInput } from './format';

interface Props {
  itemCount: number;
  onCancel: () => void;
  onApply: (mode: 'percent' | 'absolute', value: number) => Promise<void>;
}

export function BulkPriceModal({ itemCount, onCancel, onApply }: Props): React.JSX.Element | null {
  const t = useTranslations('owner.menu');
  const tForm = useTranslations('owner.menu.form');
  const [mode, setMode] = useState<'percent' | 'absolute'>('percent');
  const [raw, setRaw] = useState('');
  const [busy, setBusy] = useState(false);
  const target = typeof document === 'undefined' ? null : document.body;

  async function submit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    const value = mode === 'percent' ? Number.parseFloat(raw) : parsePriceInput(raw);
    if (!Number.isFinite(value)) return;
    setBusy(true);
    try {
      await onApply(mode, value);
    } finally {
      setBusy(false);
    }
  }

  if (!target) return null;

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button type="button" aria-label="Close" onClick={() => !busy && onCancel()} className="absolute inset-0 bg-[rgba(15,15,26,0.55)]" />
      <form onSubmit={submit} className="relative z-[71] w-full max-w-md space-y-4 rounded-2xl bg-surface-base p-6 shadow-2xl">
        <h2 className="font-display text-xl font-semibold text-text-primary">{t('bulkPriceTitle')}</h2>

        <Field label={t('bulkPriceMode')} htmlFor="bp-mode">
          <select
            id="bp-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'percent' | 'absolute')}
            className="block h-11 w-full rounded-lg border border-border-default bg-surface-base px-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
          >
            <option value="percent">{t('bulkPricePercent')}</option>
            <option value="absolute">{t('bulkPriceAbsolute')}</option>
          </select>
        </Field>

        <Field label={mode === 'percent' ? '%' : 'Price'} htmlFor="bp-val">
          <Input
            id="bp-val"
            inputMode="decimal"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={mode === 'percent' ? '+10' : '50.00'}
          />
        </Field>

        <p className="text-xs text-text-tertiary">{t('bulkPricePreview', { count: itemCount })}</p>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>
            {tForm('cancel')}
          </Button>
          <Button type="submit" loading={busy}>{t('bulkPriceApply')}</Button>
        </div>
      </form>
    </div>,
    target,
  );
}
