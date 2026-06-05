'use client';

// ── Tabla theme store — static gallery thumbnail ────────────────────────────
// Captures each theme's vibe (color, type, density, photos) so tier differences
// read at a glance, without mounting the full interactive menu.
import { COPY, ITEMS, OFFERS } from './menu-content';
import { THEMES, featuresFor } from './store-data';
import type { ThemeKey } from './store-data';

export function ThemeThumb({ themeKey }: { themeKey: ThemeKey }): React.JSX.Element {
  const theme = THEMES[themeKey];
  const feat = featuresFor(themeKey);
  const t = COPY.en;
  const cards = theme.layout === 'cards';
  const rows = ITEMS.slice(0, feat.photos ? 3 : 4);
  return (
    <div style={{ width: '100%', height: 260, background: theme.bg, fontFamily: theme.body, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', padding: '20px 16px 12px' }}>
        <div style={{ fontFamily: theme.display, fontSize: 9, color: theme.soft, letterSpacing: theme.serif ? '0.24em' : '0.1em', textTransform: 'uppercase' }}>EST · 2018</div>
        <div style={{ fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: 24, color: theme.text, letterSpacing: theme.serif ? '0.01em' : '-0.02em', marginTop: 4, lineHeight: 1 }}>{t.name}</div>
        <div style={{ fontSize: 9, color: theme.soft, marginTop: 5, letterSpacing: '0.04em' }}>{t.tagline}</div>
      </div>
      {feat.offers && <div style={{ height: 18, background: theme.primary, color: theme.dark ? theme.bg : '#fff', fontSize: 8, fontWeight: 700, display: 'flex', alignItems: 'center', paddingInline: 12, whiteSpace: 'nowrap', overflow: 'hidden' }}>{OFFERS.en[1]}</div>}
      <div style={{ flex: 1, padding: cards ? '12px 14px' : '6px 16px', display: cards ? 'grid' : 'block', gridTemplateColumns: cards ? '1fr 1fr' : undefined, gap: 10, overflow: 'hidden' }}>
        {cards
          ? rows.slice(0, 2).map((it) => (
            <div key={it.id} style={{ borderRadius: theme.radius, overflow: 'hidden', border: `1px solid ${theme.border}`, background: theme.surface }}>
              {feat.photos && <div style={{ height: 56, background: `url("${it.image}") center/cover no-repeat, linear-gradient(135deg, hsl(${it.hue},60%,76%), hsl(${(it.hue + 40) % 360},66%,66%))` }} />}
              <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: 11, color: theme.text }}>{it.en.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: 10, color: theme.primary }}>{it.price}</span>
                  {feat.cart && <span style={{ width: 16, height: 16, borderRadius: theme.radius >= 12 ? 8 : 0, background: theme.primary, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: theme.dark ? theme.bg : '#fff', fontSize: 10, fontWeight: 700 }}>+</span>}
                </div>
              </div>
            </div>
          ))
          : rows.map((it) => (
            <div key={it.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '7px 0', borderBottom: `1px solid ${theme.border}` }}>
              {feat.photos && <div style={{ width: 30, height: 30, borderRadius: theme.radius, flexShrink: 0, background: `url("${it.image}") center/cover no-repeat, linear-gradient(135deg, hsl(${it.hue},60%,76%), hsl(${(it.hue + 40) % 360},66%,66%))` }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: theme.display, fontWeight: theme.serif ? 500 : 600, fontSize: 11, color: theme.text }}>{it.en.name}</span>
                  <span style={{ fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: 10, color: theme.primary }}>{it.price}</span>
                </div>
                <div style={{ height: 7, width: '70%', borderRadius: 3, background: theme.border }} />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
