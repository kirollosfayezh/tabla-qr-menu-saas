'use client';

// ── Tabla theme store — tier pricing card ───────────────────────────────────
import { StoreIcon } from './store-icon';
import { FEATURE_KEYS, FEATURE_LABELS, THEMES, THEME_ORDER, TIERS } from './store-data';
import type { TierKey } from './store-data';

interface Props {
  tierKey: TierKey;
  onSeeThemes: (tier: TierKey) => void;
}

export function PricingCard({ tierKey, onSeeThemes }: Props): React.JSX.Element {
  const tier = TIERS[tierKey];
  const themeCount = THEME_ORDER.filter((k) => THEMES[k].tier === tierKey).length;
  const highlight = tierKey === 'standard';
  return (
    <div style={{ position: 'relative', borderRadius: 20, padding: '28px 24px', background: 'var(--surface-base)',
      border: highlight ? `2px solid ${tier.accent}` : '1px solid var(--border-subtle)',
      boxShadow: highlight ? '0 20px 50px rgba(255,107,53,0.16)' : 'var(--sh-md)', display: 'flex', flexDirection: 'column' }}>
      {highlight && <div style={{ position: 'absolute', top: -12, insetInlineStart: 24, whiteSpace: 'nowrap', zIndex: 2, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '5px 12px', borderRadius: 999, background: tier.accent, color: '#fff' }}>Most popular</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 12, height: 12, borderRadius: 4, background: tier.accent }} />
        <span style={{ fontFamily: 'var(--f-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>{tier.name}</span>
      </div>
      <div style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginTop: 4 }}>{tier.tagline}</div>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontFamily: 'var(--f-num)', fontWeight: 800, fontSize: 40, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>${tier.price}</span>
        <span style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>/month</span>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: 13, lineHeight: 1.55, color: 'var(--text-secondary)' }}>{tier.blurb}</p>
      <div style={{ height: 1, background: 'var(--border-subtle)', margin: '18px 0' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1 }}>
        {FEATURE_KEYS.map((fk) => {
          const on = tier.features[fk];
          return (
            <div key={fk} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
              <span style={{ width: 18, height: 18, borderRadius: 9, flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: on ? 'rgba(16,185,129,0.14)' : 'var(--surface-sunken)', color: on ? 'var(--success)' : 'var(--text-tertiary)' }}>
                <StoreIcon name={on ? 'check' : 'minus'} size={11} stroke={3} />
              </span>
              <span style={{ color: on ? 'var(--text-primary)' : 'var(--text-tertiary)', opacity: on ? 1 : 0.7 }}>{FEATURE_LABELS[fk]}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 12 }}>{themeCount} themes included</div>
      <button onClick={() => onSeeThemes(tierKey)} style={{ height: 46, borderRadius: 12, border: 'none', cursor: 'pointer', background: highlight ? tier.accent : 'var(--brand-accent)', color: '#fff', fontFamily: 'var(--f-ui)', fontWeight: 700, fontSize: 14 }}>See {tier.name} themes</button>
    </div>
  );
}
