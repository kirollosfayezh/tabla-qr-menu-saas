'use client';

/* eslint-disable max-lines, max-lines-per-function */

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { updateBrandingAction } from '@/app/actions/restaurant.actions';
import { ThemeRenderer } from '@/themes/theme.renderer';
import { THEMES } from '@/components/store/store-data';
import { SAMPLE_CATEGORIES } from '@/components/store/sample-snapshot';
import type { ThemeKey } from '@/components/store/store-data';
import type { ThemeOverrideDto } from '@/dtos/theme-customization.dto';
import type { CategoryWithItems, HeroPhoto, RestaurantSnapshot } from '@/themes/theme.types';
import { HeroStudio } from './hero-studio';
import { CustomizeSection } from './customize-section';
import { OffersEditor } from './offers-editor';


export interface BrandingFormValues {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  heroPhotos: HeroPhoto[];
  heroLayout: 'featured' | 'grid' | 'strip' | 'stack';
  heroImageScale: number;
  currencyCode: string;
  themeKey: string;
  themeCustomization: ThemeOverrideDto;
  promoMessages: string[];
}

interface Props {
  initial: BrandingFormValues;
  previewCategories: CategoryWithItems[];
  publicMenuHref: string;
}

export function BrandingForm({ initial, previewCategories, publicMenuHref }: Props): React.JSX.Element {
  const t = useTranslations('owner.branding');
  const [values, setValues] = useState<BrandingFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [pending, start] = useTransition();

  function update<K extends keyof BrandingFormValues>(key: K, value: BrandingFormValues[K]): void {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function onSubmit(event: React.FormEvent): void {
    event.preventDefault();
    setErrors({});
    start(async () => {
      const result = await updateBrandingAction(values);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? { _: result.message });
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <section className="rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-sm sm:p-7">
        <header className="mb-5 space-y-1">
          <h2 className="font-display text-xl font-bold text-text-primary">{t('identityTitle')}</h2>
          <p className="text-sm text-text-tertiary">{t('identityHint')}</p>
        </header>

        <LogoField value={values.logoUrl} onChange={(url) => update('logoUrl', url)} />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label={t('nameEn')} htmlFor="name" error={errors.name}>
            <Input id="name" value={values.name} onChange={(e) => update('name', e.target.value)} invalid={!!errors.name} maxLength={80} />
          </Field>
          <Field label={t('nameAr')} htmlFor="nameAr" error={errors.nameAr}>
            <Input id="nameAr" dir="rtl" value={values.nameAr} onChange={(e) => update('nameAr', e.target.value)} invalid={!!errors.nameAr} maxLength={80} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t('taglineEn')} htmlFor="description" error={errors.description}>
            <Input id="description" value={values.description} onChange={(e) => update('description', e.target.value)} invalid={!!errors.description} maxLength={120} />
          </Field>
          <Field label={t('taglineAr')} htmlFor="descriptionAr" error={errors.descriptionAr}>
            <Input id="descriptionAr" dir="rtl" value={values.descriptionAr} onChange={(e) => update('descriptionAr', e.target.value)} invalid={!!errors.descriptionAr} maxLength={120} />
          </Field>
        </div>

        <HeroStudio
          photos={values.heroPhotos}
          layout={values.heroLayout}
          scale={values.heroImageScale}
          onPhotosChange={(next) => update('heroPhotos', next)}
          onLayoutChange={(next) => update('heroLayout', next)}
          onScaleChange={(next) => update('heroImageScale', next)}
        />

        <OffersEditor
          messages={values.promoMessages}
          onChange={(next) => update('promoMessages', next)}
        />

        <div className="mt-6 border-t border-border-subtle pt-5">
          <header className="mb-1 flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <h3 className="font-display text-base font-bold text-text-primary">Theme appearance</h3>
              <p className="text-xs text-text-tertiary">
                Active theme: <span className="font-semibold text-text-primary">{THEMES[(values.themeKey as ThemeKey) in THEMES ? (values.themeKey as ThemeKey) : 'classic'].name}</span>
              </p>
            </div>
          </header>
          <CustomizeSection
            base={THEMES[(values.themeKey as ThemeKey) in THEMES ? (values.themeKey as ThemeKey) : 'classic']}
            value={values.themeCustomization}
            onChange={(patch) => update('themeCustomization', { ...values.themeCustomization, ...patch })}
            onReset={() => update('themeCustomization', {})}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {savedAt ? <span className="text-xs text-text-tertiary">{t('savedAt', { time: savedAt.toLocaleTimeString() })}</span> : null}
          {errors._ ? <span className="text-xs text-danger">{errors._}</span> : null}
          <Button type="submit" loading={pending} size="md">{t('save')}</Button>
        </div>
      </section>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <PreviewPane values={values} label={t('preview')} categories={previewCategories} publicMenuHref={publicMenuHref} />
      </div>
    </form>
  );
}

function LogoField({ value, onChange }: { value: string; onChange: (url: string) => void }): React.JSX.Element {
  const t = useTranslations('owner.branding');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function upload(file: File): Promise<void> {
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set('file', file);
      fd.set('scope', 'logo');
      const res = await fetch('/api/uploads/image', { method: 'POST', body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) throw new Error(json.error ?? 'Upload failed');
      onChange(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-text-primary">{t('logo')}</p>
      <div className="flex items-center gap-3">
        <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-primary-soft text-3xl font-bold text-brand-primary">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden>T</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex flex-1 items-center gap-3 rounded-xl border border-dashed border-border-default px-4 py-3 text-start transition hover:bg-surface-raised"
        >
          <span className="text-brand-primary" aria-hidden>↑</span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-text-primary">{uploading ? t('uploading') : t('replaceOrDrop')}</span>
            <span className="block text-xs text-text-tertiary">PNG · JPG · WebP · max 5 MB</span>
          </span>
          {value ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="text-xs font-semibold text-text-tertiary underline"
            >
              {t('remove')}
            </span>
          ) : null}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
            e.target.value = '';
          }}
        />
      </div>
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
    </div>
  );
}


function PreviewPane({
  values,
  label,
  categories,
  publicMenuHref,
}: {
  values: BrandingFormValues;
  label: string;
  categories: CategoryWithItems[];
  publicMenuHref: string;
}): React.JSX.Element {
  const t = useTranslations('owner.branding');
  const restaurant = previewRestaurant(values);
  // Show the owner's real menu; fall back to the sample only when they have no items yet.
  const previewCategories = categories.length > 0 ? categories : SAMPLE_CATEGORIES;
  const themeToken = THEMES[(values.themeKey as ThemeKey) in THEMES ? (values.themeKey as ThemeKey) : 'classic'];
  return (
    <aside className="flex flex-col items-center gap-4 rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary">{label}</p>
          <span className="rounded-full bg-brand-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-brand-primary-dark">
            {themeToken.name}
          </span>
        </div>
        <a
          href={publicMenuHref}
          target="_blank"
          className="rounded-full border border-border-default px-3 py-1.5 text-xs font-bold text-text-secondary transition hover:border-brand-primary hover:text-brand-primary"
        >
          {t('openClientView')}
        </a>
      </div>
      <div className="rounded-[36px] border border-border-default p-2 shadow-xl" style={{ background: themeToken.bg }}>
        <div className="h-[520px] w-[260px] overflow-hidden rounded-[28px]" style={{ background: themeToken.bg }}>
          <div className="pointer-events-none h-[812px] w-[390px] origin-top-left scale-[0.667] overflow-hidden">
            <ThemeRenderer restaurant={restaurant} categories={previewCategories} locale="en" />
          </div>
        </div>
      </div>
    </aside>
  );
}

function previewRestaurant(values: BrandingFormValues): RestaurantSnapshot {
  return {
    id: '00000000-0000-0000-0000-000000000000',
    slug: 'preview',
    name: values.name || 'Restaurant',
    nameAr: values.nameAr || null,
    description: values.description || null,
    descriptionAr: values.descriptionAr || null,
    logoUrl: values.logoUrl || null,
    whatsappNumber: '+201000000000',
    defaultLocale: 'en',
    primaryColor: values.primaryColor,
    secondaryColor: values.secondaryColor,
    accentColor: values.accentColor,
    heroPhotos: values.heroPhotos ?? [],
    heroLayout: values.heroLayout,
    heroImageScale: values.heroImageScale,
    currencyCode: values.currencyCode,
    taxPercent: 0,
    serviceChargePercent: 0,
    status: 'ACTIVE',
    themeKey: values.themeKey,
    themeCustomization: values.themeCustomization,
    promoMessages: values.promoMessages,
  };
}

