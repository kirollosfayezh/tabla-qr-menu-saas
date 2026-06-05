'use client';

// ── Tabla theme store — live customizer panel ───────────────────────────────
import type { ReactNode } from 'react';
import { StoreIcon } from './store-icon';
import { ACCENTS, CORNERS, FONTS, MOODS, pickFg } from './store-customization';
import type { ThemeOverride } from './store-customization';
import type { ThemeToken } from './store-data';

function Swatch({ color, on, onClick, title }: { color: string; on: boolean; onClick: () => void; title: string }): React.JSX.Element {
  return (
    <button onClick={onClick} title={title} style={{ width: 30, height: 30, borderRadius: 9, cursor: 'pointer', flexShrink: 0, position: 'relative',
      background: color, border: 'none', outline: on ? '2px solid #fff' : '2px solid transparent', outlineOffset: 2,
      boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14)' }}>
      {on && <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><StoreIcon name="check" size={15} color={pickFg(color)} stroke={3} /></span>}
    </button>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }): React.JSX.Element {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#8A8A9A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 11 }}>{title}</div>
      {children}
    </div>
  );
}

interface Props {
  open: boolean;
  base: ThemeToken;
  custom: ThemeOverride;
  setCustom: (patch: ThemeOverride) => void;
  onReset: () => void;
}

export function CustomizePanel({ open, base, custom, setCustom, onReset }: Props): React.JSX.Element {
  const eff = { ...base, ...custom };
  const moodOn = (bg: string): boolean => eff.bg.toLowerCase() === bg.toLowerCase();
  return (
    <div className="tabla-customize-panel no-bar" style={{ width: 300, flexShrink: 0, height: '100%', overflowY: 'auto',
      background: 'rgba(18,18,28,0.72)', backdropFilter: 'blur(16px)', borderInlineEnd: '1px solid rgba(255,255,255,0.08)',
      transition: 'margin .34s cubic-bezier(.16,1,.3,1), opacity .3s',
      marginInlineStart: open ? 0 : -300, opacity: open ? 1 : 0, padding: open ? '22px 20px 40px' : '22px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
        <StoreIcon name="palette" size={17} color="#FF6B35" />
        <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 16, color: '#fff' }}>Customize</span>
      </div>

      <Section title="Accent color">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {ACCENTS.map((a) => <Swatch key={a.v} color={a.v} title={a.name} on={eff.primary.toLowerCase() === a.v.toLowerCase()} onClick={() => setCustom({ primary: a.v })} />)}
        </div>
      </Section>

      <Section title="Background mood">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOODS.map((m) => {
            const on = moodOn(m.bg);
            return (
              <button key={m.name} onClick={() => setCustom({ bg: m.bg, surface: m.surface, text: m.text, soft: m.soft, border: m.border, secondary: m.secondary, dark: m.dark })}
                style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 10px', borderRadius: 11, cursor: 'pointer', textAlign: 'left',
                  background: on ? 'rgba(255,255,255,0.1)' : 'transparent', border: on ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ display: 'flex', flexShrink: 0 }}>
                  <span style={{ width: 18, height: 26, borderRadius: '6px 0 0 6px', background: m.bg, border: '1px solid rgba(255,255,255,0.15)', borderInlineEnd: 'none' }} />
                  <span style={{ width: 18, height: 26, borderRadius: '0 6px 6px 0', background: m.surface, border: '1px solid rgba(255,255,255,0.15)' }} />
                </span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#E8E8EC' }}>{m.name}</span>
                {on && <StoreIcon name="check" size={15} color="#FF6B35" stroke={3} />}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Corners">
        <div style={{ display: 'flex', gap: 8 }}>
          {CORNERS.map((c) => {
            const on = Math.abs((eff.radius ?? 12) - c.v) <= 3;
            return (
              <button key={c.name} onClick={() => setCustom({ radius: c.v })} style={{ flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
                background: on ? '#fff' : 'rgba(255,255,255,0.06)', color: on ? '#0F0F1A' : '#B4B4C4', border: 'none', fontFamily: 'var(--f-ui)', fontSize: 12.5, fontWeight: 600,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 20, height: 20, border: '2px solid currentColor', borderRadius: c.v === 22 ? 10 : c.v === 12 ? 6 : 2 }} />
                {c.name}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Typography">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FONTS.map((f) => {
            const on = eff.display === f.display;
            return (
              <button key={f.name} onClick={() => setCustom({ display: f.display, serif: f.serif })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderRadius: 11, cursor: 'pointer',
                background: on ? 'rgba(255,255,255,0.1)' : 'transparent', border: on ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontFamily: f.display, fontSize: 18, fontWeight: f.serif ? 500 : 700, color: '#fff' }}>{f.name}</span>
                {on && <StoreIcon name="check" size={15} color="#FF6B35" stroke={3} />}
              </button>
            );
          })}
        </div>
      </Section>

      <button onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 10, cursor: 'pointer',
        background: 'transparent', border: '1px solid rgba(255,255,255,0.16)', color: '#B4B4C4', fontFamily: 'var(--f-ui)', fontSize: 13, fontWeight: 600 }}>
        <StoreIcon name="refresh" size={14} />Reset to original
      </button>
    </div>
  );
}
