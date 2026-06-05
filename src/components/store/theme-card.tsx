'use client';

// ── Tabla theme store — gallery card ────────────────────────────────────────
// Canonical design: qrcode menu/store.jsx → ThemeCard. A single solid surface
// card — thumbnail on top (tier badge + hover "Live preview"), identity + actions
// in the footer. The footer is a slot so the owner studio can inject its own
// action row while the marketing gallery keeps the default Preview button.
import type { ReactNode } from 'react';
import { StoreIcon } from './store-icon';
import { ThemeThumb } from './theme-thumb';
import { THEMES, TIERS } from './store-data';
import type { ThemeKey } from './store-data';

interface Props {
  themeKey: ThemeKey;
  isCurrent: boolean;
  onPreview: (key: ThemeKey) => void;
  /** Optional footer override (owner studio). Defaults to name + Preview button. */
  footer?: ReactNode;
}

const TIER_BADGE: React.CSSProperties = {
  position: 'absolute', top: 12, insetInlineStart: 12,
  fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '0.08em', padding: '4px 9px', borderRadius: 999,
};

export function ThemeCard({ themeKey, isCurrent, onPreview, footer }: Props): React.JSX.Element {
  const theme = THEMES[themeKey];
  const tier = TIERS[theme.tier];

  return (
    <div
      className="theme-card tabla-theme-card"
      style={{
        borderRadius: 18,
        overflow: 'hidden',
        background: 'var(--surface-base)',
        border: isCurrent ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
        boxShadow: 'var(--sh-md)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Thumbnail ────────────────────────────────────── */}
      <div style={{ position: 'relative', borderBottom: '1px solid var(--border-subtle)' }}>
        <ThemeThumb themeKey={themeKey} />

        <div style={{ ...TIER_BADGE, background: tier.accent, color: '#0F0F1A' }}>{tier.name}</div>
        {isCurrent && (
          <div style={{ position: 'absolute', top: 12, insetInlineEnd: 12, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 9px', borderRadius: 999, background: 'var(--brand-primary)', color: '#fff' }}>
            Active
          </div>
        )}

        <button
          onClick={() => onPreview(themeKey)}
          aria-label={`Preview ${theme.name}`}
          className="tabla-card-hover"
          style={{ position: 'absolute', inset: 0, background: 'rgba(15,15,26,0)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all .18s' }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 42, padding: '0 18px', borderRadius: 999, background: '#fff', color: '#0F0F1A', fontFamily: 'var(--f-ui)', fontWeight: 700, fontSize: 14, boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}>
            <StoreIcon name="play" size={15} />Live preview
          </span>
        </button>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      {footer ?? (
        <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{theme.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{theme.sub}</div>
          </div>
          <button
            onClick={() => onPreview(themeKey)}
            style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 7, height: 38, padding: '0 14px', borderRadius: 10, border: '1px solid var(--border-default)', background: 'var(--surface-base)', color: 'var(--text-primary)', fontFamily: 'var(--f-ui)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
          >
            <StoreIcon name="eye" size={15} />Preview
          </button>
        </div>
      )}
    </div>
  );
}
