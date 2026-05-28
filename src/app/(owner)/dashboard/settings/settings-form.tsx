'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { updateSettingsAction } from '@/app/actions/restaurant.actions';

export interface SettingsFormValues {
  whatsappNumber: string;
  currencyCode: string;
  defaultLocale: 'en' | 'ar';
  taxPercent: number;
  serviceChargePercent: number;
}

interface Props {
  initial: SettingsFormValues;
}

export function SettingsForm({ initial }: Props): React.JSX.Element {
  const t = useTranslations('owner.settings');
  const [values, setValues] = useState<SettingsFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [pending, start] = useTransition();

  function set<K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]): void {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent): void {
    event.preventDefault();
    setErrors({});
    start(async () => {
      const result = await updateSettingsAction(values);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? { _: result.message });
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <section className="rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-sm sm:p-7">
        <Field label={t('whatsapp')} htmlFor="wa" error={errors.whatsappNumber} hint={t('whatsappHint')}>
          <Input
            id="wa"
            value={values.whatsappNumber}
            onChange={(e) => set('whatsappNumber', e.target.value)}
            placeholder="+201234567890"
            invalid={!!errors.whatsappNumber}
          />
        </Field>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label={t('currency')} htmlFor="currency" error={errors.currencyCode} hint={t('currencyHint')}>
            <Input
              id="currency"
              value={values.currencyCode}
              onChange={(e) => set('currencyCode', e.target.value.toUpperCase().slice(0, 3))}
              invalid={!!errors.currencyCode}
              maxLength={3}
            />
          </Field>
          <Field label={t('defaultLocale')} htmlFor="locale">
            <select
              id="locale"
              value={values.defaultLocale}
              onChange={(e) => set('defaultLocale', e.target.value as 'en' | 'ar')}
              className="block h-11 w-full rounded-lg border border-border-default bg-surface-base px-3 text-sm text-text-primary focus:border-brand-primary focus:outline-none"
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </Field>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label={t('tax')} htmlFor="tax" error={errors.taxPercent}>
            <Input
              id="tax"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={values.taxPercent}
              onChange={(e) => set('taxPercent', Number(e.target.value))}
              invalid={!!errors.taxPercent}
            />
          </Field>
          <Field label={t('service')} htmlFor="service" error={errors.serviceChargePercent}>
            <Input
              id="service"
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={values.serviceChargePercent}
              onChange={(e) => set('serviceChargePercent', Number(e.target.value))}
              invalid={!!errors.serviceChargePercent}
            />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {savedAt ? <span className="text-xs text-text-tertiary">{t('savedAt', { time: savedAt.toLocaleTimeString() })}</span> : null}
          {errors._ ? <span className="text-xs text-danger">{errors._}</span> : null}
          <Button type="submit" loading={pending} size="md">{t('save')}</Button>
        </div>
      </section>
    </form>
  );
}
