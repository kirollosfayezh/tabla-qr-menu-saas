'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { MAX_UPLOAD_BYTES } from '@/config/constants';

interface Props {
  value: string;
  /** The image already on the saved entity. Used to decide which URLs are orphans (uploaded this session but not yet saved). */
  baselineUrl: string;
  onChange: (url: string) => void;
  scope: 'item' | 'logo';
  onError: (message: string) => void;
}

interface UploadResponse {
  ok: boolean;
  url?: string;
  message?: string;
  code?: string;
}

/** Best-effort cleanup of an orphan image. Failure is logged, never thrown. */
export async function deleteUploadedImage(url: string): Promise<void> {
  try {
    await fetch(`/api/uploads/image?url=${encodeURIComponent(url)}`, { method: 'DELETE' });
  } catch {
    /* swallow — orphan cleanup is best-effort */
  }
}

/** Photo dropzone for menu items. Uploads to /api/uploads/image and writes back the URL. */
export function ItemImageUploader({
  value,
  baselineUrl,
  onChange,
  scope,
  onError,
}: Props): React.JSX.Element {
  const t = useTranslations('owner.menu.form');
  const tErrors = useTranslations('owner.menu.errors');
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File): Promise<void> {
    if (file.size > MAX_UPLOAD_BYTES) {
      onError(tErrors('fileTooLarge'));
      return;
    }
    setBusy(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('scope', scope);
      const res = await fetch('/api/uploads/image', { method: 'POST', body: form });
      const json = (await res.json()) as UploadResponse;
      if (!res.ok || !json.ok || !json.url) {
        onError(json.message ?? tErrors('uploadFailed'));
        return;
      }
      // If we're replacing an in-session upload (not the saved baseline), clean up the previous one.
      if (value && value !== baselineUrl) {
        void deleteUploadedImage(value);
      }
      onChange(json.url);
    } catch {
      onError(tErrors('uploadFailed'));
    } finally {
      setBusy(false);
    }
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = '';
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className="relative flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-default bg-surface-raised p-4 text-center"
    >
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-28 w-28 rounded-lg object-cover" />
      ) : (
        <p className="text-xs text-text-tertiary">{t('imageDrop')}</p>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onPick}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          loading={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? t('imageUploading') : value ? t('imageReplace') : t('image')}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (value !== baselineUrl) void deleteUploadedImage(value);
              onChange('');
            }}
          >
            {t('imageRemove')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
