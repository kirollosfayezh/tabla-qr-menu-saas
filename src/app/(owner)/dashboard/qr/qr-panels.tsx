'use client';

import type { ModuleStyle } from './render';

const MODULE_STYLES: ReadonlyArray<ModuleStyle> = ['square', 'rounded', 'dots'];
const MODULE_CELLS = [1, 1, 0, 1, 1, 1, 0, 1, 1] as const;

export function QrPreview({
  png,
  previewAlt,
  menuUrl,
  onPng,
  onSvg,
  onPdf,
}: {
  png: string;
  previewAlt: string;
  menuUrl: string;
  onPng: () => void;
  onSvg: () => void;
  onPdf: () => void;
}): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-border-subtle bg-gradient-to-b from-surface-base to-surface-raised p-5 shadow-sm sm:p-8">
      <div className="mx-auto max-w-[320px]">
        <div className="rounded-[22px] bg-white p-4 shadow-lg">
          <div className="aspect-square rounded-xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {png ? <img src={png} alt={previewAlt} className="h-full w-full" /> : null}
          </div>
        </div>
        <p className="mt-5 break-all text-center font-mono text-sm text-text-secondary">{menuUrl}</p>
        <div className="mt-6 grid grid-cols-3 gap-2">
          <DownloadButton onClick={onPng} label="PNG" />
          <DownloadButton onClick={onSvg} label="SVG" />
          <DownloadButton onClick={onPdf} label="PDF" primary />
        </div>
      </div>
    </div>
  );
}

export function DownloadButton({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? 'inline-flex h-11 items-center justify-center rounded-lg bg-brand-primary px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-dark'
          : 'inline-flex h-11 items-center justify-center rounded-lg border border-border-default bg-surface-base px-3 text-sm font-semibold text-text-primary shadow-sm transition hover:bg-surface-raised'
      }
    >
      {label}
    </button>
  );
}

export function ColorSwatch({
  swatch,
  active,
  label,
  onSelect,
}: {
  swatch: string;
  active: boolean;
  label: string;
  onSelect: (value: string) => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onSelect(swatch)}
      className="flex h-10 w-10 items-center justify-center rounded-lg border-[3px] transition"
      style={{ backgroundColor: swatch, borderColor: active ? 'var(--brand-primary)' : 'transparent' }}
    >
      {active ? <span className="text-sm font-bold text-white">✓</span> : null}
    </button>
  );
}

export function ModuleStylePreview({
  color,
  active,
  onSelect,
}: {
  color: string;
  active: ModuleStyle;
  onSelect: (value: ModuleStyle) => void;
}): React.JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {MODULE_STYLES.map((style) => {
        const isActive = style === active;
        return (
          <button
            key={style}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(style)}
            className={
              isActive
                ? 'rounded-xl border-2 border-brand-primary bg-surface-base p-4 text-start transition'
                : 'rounded-xl border border-border-subtle bg-surface-base p-4 text-start opacity-70 transition hover:opacity-100'
            }
          >
            <div className="mb-3 grid grid-cols-3 gap-1">
              {MODULE_CELLS.map((on, cell) => (
                <span
                  key={cell}
                  className="aspect-square"
                  style={{
                    backgroundColor: on ? color : 'transparent',
                    borderRadius: style === 'dots' ? '999px' : style === 'rounded' ? '3px' : '0px',
                  }}
                />
              ))}
            </div>
            <p className="text-center text-xs font-semibold capitalize text-text-secondary">{style}</p>
          </button>
        );
      })}
    </div>
  );
}
