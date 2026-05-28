'use client';

/* eslint-disable max-lines, max-lines-per-function */

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { heroTransform } from '@/themes/shared/hero-strip';
import type { HeroPhoto } from '@/themes/theme.types';

interface Props {
  photos: HeroPhoto[];
  layout: 'featured' | 'grid' | 'strip' | 'stack';
  scale: number;
  onPhotosChange: (next: HeroPhoto[]) => void;
  onLayoutChange: (layout: 'featured' | 'grid' | 'strip' | 'stack') => void;
  onScaleChange: (scale: number) => void;
}

const MAX_PHOTOS = 6;

/**
 * Hero photo studio — drag-and-drop reorder, per-photo rotate/flip, click-to-zoom lightbox.
 * Persists every transform via the parent `onPhotosChange`.
 */
export function HeroStudio({
  photos,
  layout,
  scale,
  onPhotosChange,
  onLayoutChange,
  onScaleChange,
}: Props): React.JSX.Element {
  const t = useTranslations('owner.branding');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  async function upload(files: FileList | null): Promise<void> {
    if (!files?.length) return;
    setError('');
    setUploading(true);
    try {
      const next = [...photos];
      for (const file of Array.from(files).slice(0, MAX_PHOTOS - next.length)) {
        const fd = new FormData();
        fd.set('file', file);
        fd.set('scope', 'hero');
        const res = await fetch('/api/uploads/image', { method: 'POST', body: fd });
        const json = (await res.json()) as { url?: string; message?: string };
        if (!res.ok || !json.url) throw new Error(json.message ?? 'Upload failed');
        next.push({ url: json.url, rotation: 0, flipX: false, flipY: false });
      }
      onPhotosChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function update(index: number, patch: Partial<HeroPhoto>): void {
    onPhotosChange(photos.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function remove(index: number): void {
    onPhotosChange(photos.filter((_, i) => i !== index));
  }

  function reorder(from: number, to: number): void {
    if (from === to) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onPhotosChange(next);
  }

  return (
    <section className="mt-6 rounded-2xl border border-border-subtle bg-surface-raised p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">{t('heroTitle')}</h3>
          <p className="text-xs text-text-tertiary">{t('heroHint')}</p>
        </div>
        <Button type="button" variant="secondary" size="sm" loading={uploading} disabled={photos.length >= MAX_PHOTOS} onClick={() => inputRef.current?.click()}>
          {t('addHeroPhoto')}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void upload(event.target.files);
            event.target.value = '';
          }}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {(['featured', 'grid', 'strip', 'stack'] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onLayoutChange(opt)}
            className={cn(
              'rounded-xl border px-3 py-2 text-sm font-semibold capitalize transition',
              layout === opt
                ? 'border-brand-primary bg-brand-primary-soft text-brand-primary'
                : 'border-border-default bg-surface-base text-text-secondary',
            )}
          >
            {t(`heroLayouts.${opt}`)}
          </button>
        ))}
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold text-text-secondary">{t('heroScale')}</span>
        <input
          type="range"
          min={70}
          max={140}
          value={scale}
          onChange={(event) => onScaleChange(Number(event.target.value))}
          className="w-full accent-brand-primary"
        />
      </label>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {photos.map((photo, index) => (
          <HeroTile
            key={photo.url}
            photo={photo}
            index={index}
            isDragOver={dragIndex !== null && dragIndex !== index}
            onDragStart={() => setDragIndex(index)}
            onDragEnd={() => setDragIndex(null)}
            onDrop={(from) => reorder(from, index)}
            onOpen={() => setOpenedIndex(index)}
            onRotate={() => update(index, { rotation: nextRotation(photo.rotation) })}
            onFlipX={() => update(index, { flipX: !photo.flipX })}
            onFlipY={() => update(index, { flipY: !photo.flipY })}
            onRemove={() => remove(index)}
            t={t}
          />
        ))}
        {photos.length === 0 ? (
          <button type="button" onClick={() => inputRef.current?.click()} className="aspect-square rounded-xl border border-dashed border-border-default text-xs font-semibold text-text-tertiary">
            {t('addHeroPhoto')}
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}

      {openedIndex !== null && photos[openedIndex] ? (
        <HeroLightbox
          photo={photos[openedIndex]!}
          onClose={() => setOpenedIndex(null)}
          onRotate={() => update(openedIndex, { rotation: nextRotation(photos[openedIndex]!.rotation) })}
          onFlipX={() => update(openedIndex, { flipX: !photos[openedIndex]!.flipX })}
          onFlipY={() => update(openedIndex, { flipY: !photos[openedIndex]!.flipY })}
          onReset={() => update(openedIndex, { rotation: 0, flipX: false, flipY: false })}
          t={t}
        />
      ) : null}
    </section>
  );
}

function nextRotation(r: HeroPhoto['rotation']): HeroPhoto['rotation'] {
  return r === 0 ? 90 : r === 90 ? 180 : r === 180 ? 270 : 0;
}

interface TileProps {
  photo: HeroPhoto;
  index: number;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDrop: (fromIndex: number) => void;
  onOpen: () => void;
  onRotate: () => void;
  onFlipX: () => void;
  onFlipY: () => void;
  onRemove: () => void;
  t: (key: string) => string;
}

function HeroTile({ photo, index, isDragOver, onDragStart, onDragEnd, onDrop, onOpen, onRotate, onFlipX, onFlipY, onRemove, t }: TileProps): React.JSX.Element {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(index));
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        e.preventDefault();
        const from = Number(e.dataTransfer.getData('text/plain'));
        if (!Number.isNaN(from)) onDrop(from);
        onDragEnd();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative aspect-square cursor-grab overflow-hidden rounded-xl border bg-surface-base active:cursor-grabbing',
        isDragOver ? 'border-brand-primary ring-2 ring-brand-primary/40' : 'border-border-subtle',
      )}
    >
      <button type="button" onClick={onOpen} className="block h-full w-full" aria-label={t('studioZoom')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="" className="h-full w-full object-cover" style={{ transform: heroTransform(photo, 1) }} />
      </button>
      <div className="absolute inset-x-1 top-1 flex items-center justify-between opacity-0 transition group-hover:opacity-100">
        <span className="rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{index + 1}</span>
        <div className="flex gap-1">
          <IconBtn label={t('studioRotate')} onClick={onRotate}>↻</IconBtn>
          <IconBtn label={t('studioFlipX')} onClick={onFlipX}>⇆</IconBtn>
          <IconBtn label={t('studioFlipY')} onClick={onFlipY}>⇅</IconBtn>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute inset-x-1 bottom-1 rounded-lg bg-black/70 px-2 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100"
      >
        {t('remove')}
      </button>
    </div>
  );
}

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }): React.JSX.Element {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-xs font-bold text-white hover:bg-black"
    >
      {children}
    </button>
  );
}

interface LightboxProps {
  photo: HeroPhoto;
  onClose: () => void;
  onRotate: () => void;
  onFlipX: () => void;
  onFlipY: () => void;
  onReset: () => void;
  t: (key: string) => string;
}

function HeroLightbox({ photo, onClose, onRotate, onFlipX, onFlipY, onReset, t }: LightboxProps): React.JSX.Element {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/80 p-6"
    >
      <div onClick={(e) => e.stopPropagation()} className="flex max-h-[70vh] max-w-[90vw] items-center justify-center overflow-hidden rounded-2xl bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.url}
          alt=""
          className="max-h-[70vh] max-w-[90vw] object-contain"
          style={{ transform: heroTransform(photo, 1) }}
        />
      </div>
      <div onClick={(e) => e.stopPropagation()} className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-white/95 px-3 py-2 shadow-xl">
        <Button type="button" variant="secondary" size="sm" onClick={onRotate}>↻ {t('studioRotate')}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onFlipX}>⇆ {t('studioFlipX')}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onFlipY}>⇅ {t('studioFlipY')}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onReset}>{t('studioReset')}</Button>
        <Button type="button" size="sm" onClick={onClose}>{t('studioClose')}</Button>
      </div>
    </div>
  );
}
