'use client';

import { ThemeLayoutKinds } from '@/dtos/theme-design.dto';
import type { ThemeDesign } from '@/dtos/theme-design.dto';

const COLORS: ReadonlyArray<{ key: keyof ThemeDesign; label: string }> = [
  { key: 'bg', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'text', label: 'Text' },
  { key: 'soft', label: 'Muted text' },
  { key: 'border', label: 'Border' },
];

/** Admin controls for a theme's visual design tokens (colours, layout, fonts, shape). */
export function ThemeDesignFields({ value, onChange }: { value: ThemeDesign; onChange: (d: ThemeDesign) => void }): React.JSX.Element {
  const set = <K extends keyof ThemeDesign>(k: K, v: ThemeDesign[K]): void => onChange({ ...value, [k]: v });

  return (
    <div className="mt-4 rounded-xl border border-border-subtle bg-surface-sunken/40 p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-tertiary">Design — controls the real look</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {COLORS.map((c) => (
          <label key={c.key} className="block">
            <span className="mb-1 block text-[11px] font-semibold text-text-secondary">{c.label}</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value[c.key] as string}
                onChange={(e) => set(c.key, e.target.value as ThemeDesign[typeof c.key])}
                className="h-8 w-9 shrink-0 cursor-pointer rounded border border-border-default bg-transparent"
              />
              <input
                value={value[c.key] as string}
                onChange={(e) => set(c.key, e.target.value as ThemeDesign[typeof c.key])}
                className="h-8 w-full rounded-lg border border-border-default bg-surface-base px-2 font-mono text-xs"
              />
            </div>
          </label>
        ))}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-text-secondary">Layout</span>
          <select
            value={value.layout}
            onChange={(e) => set('layout', e.target.value as ThemeDesign['layout'])}
            className="h-9 w-full rounded-lg border border-border-default bg-surface-base px-2 text-sm"
          >
            {ThemeLayoutKinds.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-text-secondary">Corner radius (px)</span>
          <input
            type="number" min={0} max={32}
            value={value.radius}
            onChange={(e) => set('radius', Number(e.target.value))}
            className="h-9 w-full rounded-lg border border-border-default bg-surface-base px-2 font-mono text-sm"
          />
        </label>
        <div className="flex items-end gap-4 pb-1">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={value.serif} onChange={(e) => set('serif', e.target.checked)} />Serif</label>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={value.dark} onChange={(e) => set('dark', e.target.checked)} />Dark</label>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-text-secondary">Display font (CSS family)</span>
          <input value={value.display} onChange={(e) => set('display', e.target.value)} className="h-9 w-full rounded-lg border border-border-default bg-surface-base px-2 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-text-secondary">Body font (CSS family)</span>
          <input value={value.body} onChange={(e) => set('body', e.target.value)} className="h-9 w-full rounded-lg border border-border-default bg-surface-base px-2 text-sm" />
        </label>
      </div>
    </div>
  );
}
