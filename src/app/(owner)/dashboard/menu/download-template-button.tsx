'use client';

import { useTranslations } from 'next-intl';
import { buildMenuTemplateCsv } from './menu-template';

/** Downloads the example import sheet (CSV, opens in Excel) so owners can fill it and import. */
export function DownloadTemplateButton(): React.JSX.Element {
  const t = useTranslations('owner.menu');

  function download(): void {
    const blob = new Blob([buildMenuTemplateCsv()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tabla-menu-template.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border-default bg-surface-base px-4 text-sm font-semibold text-text-primary transition hover:bg-surface-raised"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {t('downloadTemplate')}
    </button>
  );
}
