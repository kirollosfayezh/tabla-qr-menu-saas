'use client';

import { StoreIcon } from '@/components/store/store-icon';
import { ACCENTS, CORNERS, FONTS, MOODS, pickFg } from '@/components/store/store-customization';
import type { ThemeOverrideDto } from '@/dtos/theme-customization.dto';
import type { ThemeToken } from '@/components/store/store-data';

interface Props {
  base: ThemeToken;
  value: ThemeOverrideDto;
  onChange: (patch: ThemeOverrideDto) => void;
  onReset: () => void;
}

function Label({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-text-tertiary">{children}</p>;
}

export function CustomizeSection({ base, value, onChange, onReset }: Props): React.JSX.Element {
  const effBg = value.bg ?? base.bg;
  const effRadius = value.radius ?? base.radius;
  const effDisplay = value.display ?? base.display;
  const effPrimary = value.primary ?? base.primary;
  const hasOverrides = Object.keys(value).length > 0;

  return (
    <div className="mt-5 space-y-5">
      <div>
        <Label>Accent color</Label>
        <div className="flex flex-wrap gap-2">
          {ACCENTS.map((a) => {
            const on = effPrimary.toLowerCase() === a.v.toLowerCase();
            return (
              <button
                key={a.v}
                type="button"
                title={a.name}
                onClick={() => onChange({ primary: a.v as ThemeOverrideDto['primary'] })}
                className="h-7 w-7 rounded-lg border-2 transition"
                style={{ backgroundColor: a.v, borderColor: on ? 'var(--text-primary)' : 'transparent' }}
              />
            );
          })}
        </div>
      </div>

      <Label>Background mood</Label>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {MOODS.map((m) => {
          const on = effBg.toLowerCase() === m.bg.toLowerCase();
          return (
            <button
              key={m.name}
              type="button"
              onClick={() => onChange({ bg: m.bg, surface: m.surface, text: m.text, soft: m.soft, border: m.border, secondary: m.secondary, dark: m.dark })}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-start text-sm font-semibold transition ${on ? 'border-brand-primary bg-brand-primary-soft text-brand-primary' : 'border-border-subtle bg-surface-base text-text-secondary hover:border-border-default'}`}
            >
              <span className="flex flex-shrink-0">
                <span className="h-5 w-4 rounded-l-[4px] border border-black/10" style={{ background: m.bg }} />
                <span className="h-5 w-4 rounded-r-[4px] border border-l-0 border-black/10" style={{ background: m.surface }} />
              </span>
              {m.name}
            </button>
          );
        })}
      </div>

      <div>
        <Label>Corners</Label>
        <div className="flex gap-2">
          {CORNERS.map((c) => {
            const on = Math.abs(effRadius - c.v) <= 3;
            return (
              <button
                key={c.name}
                type="button"
                onClick={() => onChange({ radius: c.v })}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-2.5 text-xs font-semibold transition ${on ? 'border-brand-primary bg-brand-primary-soft text-brand-primary' : 'border-border-subtle bg-surface-base text-text-secondary hover:border-border-default'}`}
              >
                <span
                  className="h-5 w-5 border-2"
                  style={{ borderColor: 'currentColor', borderRadius: c.v === 22 ? 10 : c.v === 12 ? 5 : 2 }}
                />
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Typography</Label>
        <div className="flex flex-col gap-2">
          {FONTS.map((f) => {
            const on = effDisplay === f.display;
            return (
              <button
                key={f.name}
                type="button"
                onClick={() => onChange({ display: f.display as ThemeOverrideDto['display'], serif: f.serif })}
                className={`flex items-center justify-between rounded-xl border px-4 py-2.5 transition ${on ? 'border-brand-primary bg-brand-primary-soft' : 'border-border-subtle bg-surface-base hover:border-border-default'}`}
              >
                <span
                  className="text-xl"
                  style={{ fontFamily: f.display, fontWeight: f.serif ? 500 : 700, color: on ? 'var(--brand-primary)' : 'var(--text-primary)' }}
                >
                  {f.name}
                </span>
                {on && <StoreIcon name="check" size={15} color="var(--brand-primary)" stroke={3} />}
              </button>
            );
          })}
        </div>
      </div>

      {hasOverrides && (
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm font-semibold text-text-tertiary underline-offset-2 hover:text-text-secondary hover:underline"
        >
          <StoreIcon name="refresh" size={13} />Reset to theme defaults
        </button>
      )}
    </div>
  );
}

export { pickFg };
