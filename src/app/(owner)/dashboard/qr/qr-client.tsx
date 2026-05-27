'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { QR_DOWNLOAD_SIZE, QR_PDF_SIZE } from '@/config/constants';
import { buildQrPdf } from './pdf';
import { ColorSwatch, ModuleStylePreview, QrPreview } from './qr-panels';
import { renderQrPng, renderQrSvg, type ModuleStyle } from './render';

interface Props {
  restaurantName: string;
  menuUrl: string;
  primaryColor: string;
}

export function QrClient({ restaurantName, menuUrl, primaryColor }: Props): React.JSX.Element {
  const t = useTranslations('owner.qr');
  const [color, setColor] = useState(primaryColor);
  const [style, setStyle] = useState<ModuleStyle>('square');
  const [png, setPng] = useState('');
  const swatches = useMemo(() => ['#1A1A2E', primaryColor, '#FF6B35', '#2563EB', '#10B981', '#7C3AED', '#000000'], [primaryColor]);

  useEffect(() => {
    void renderQrPng({ url: menuUrl, color, style, size: QR_DOWNLOAD_SIZE }).then(setPng);
  }, [menuUrl, color, style]);

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(420px,1.1fr)]">
      <QrPreview
        png={png}
        previewAlt={t('previewAlt')}
        menuUrl={menuUrl}
        onPng={() => downloadPng(png)}
        onSvg={() => void downloadSvg(menuUrl, color, style)}
        onPdf={() => void downloadPdf(restaurantName, menuUrl, png)}
      />

      <div className="rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-sm sm:p-7">
        <div>
          <h2 className="font-display text-xl font-bold text-text-primary">{t('customizeTitle')}</h2>
          <p className="mt-1 text-sm text-text-tertiary">{t('customizeDescription')}</p>
        </div>

        <div className="mt-6 space-y-7">
          <div>
            <label className="mb-3 block text-sm font-semibold text-text-primary">{t('color')}</label>
            <div className="flex flex-wrap items-center gap-2">
              {swatches.map((swatch) => (
                <ColorSwatch
                  key={swatch}
                  swatch={swatch}
                  active={swatch.toLowerCase() === color.toLowerCase()}
                  label={`${t('color')} ${swatch}`}
                  onSelect={setColor}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                className="h-10 w-10 rounded-lg border border-dashed border-border-default bg-surface-sunken p-1"
                aria-label={t('color')}
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold text-text-primary">{t('moduleStyle')}</p>
            <ModuleStylePreview color={color} active={style} onSelect={setStyle} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">{t('destination')}</label>
            <p className="break-all rounded-lg bg-surface-sunken p-3 font-mono text-sm text-text-secondary">{menuUrl}</p>
            <p className="mt-2 text-xs text-text-tertiary">{t('destinationHint')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function downloadPng(dataUrl: string): void {
  if (!dataUrl) return;
  download(dataUrl, 'tabla-qr.png');
}

async function downloadSvg(menuUrl: string, color: string, style: ModuleStyle): Promise<void> {
  const svg = renderQrSvg({ url: menuUrl, color, style });
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  download(URL.createObjectURL(blob), 'tabla-qr.svg');
}

async function downloadPdf(title: string, url: string, png: string): Promise<void> {
  if (!png) return;
  const bytes = dataUrlBytes(await toJpeg(png));
  const blob = buildQrPdf({ title, url, jpegBytes: bytes, width: QR_PDF_SIZE, height: QR_PDF_SIZE });
  download(URL.createObjectURL(blob), 'tabla-qr.pdf');
}

async function toJpeg(dataUrl: string): Promise<string> {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return dataUrl;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.92);
}

function dataUrlBytes(dataUrl: string): Uint8Array {
  const raw = atob(dataUrl.split(',')[1] ?? '');
  return Uint8Array.from(raw, (char) => char.charCodeAt(0));
}

function download(href: string, filename: string): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.click();
}
