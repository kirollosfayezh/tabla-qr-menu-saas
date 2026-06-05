'use client';

// ── Tabla theme store — small shared menu chrome (ticker, tabs, hero, top bar) ─
import { useState } from 'react';
import { StoreIcon } from './store-icon';
import { OFFERS } from './menu-content';
import type { EffectiveTheme } from './store-customization';
import type { Category, Copy, Lang } from './menu-content';
import type { FeatureFlags } from './store-data';

export function Ticker({ theme, lang, big = false }: { theme: EffectiveTheme; lang: Lang; big?: boolean }): React.JSX.Element {
  const list = OFFERS[lang];
  return (
    <div style={{ overflow: 'hidden', background: theme.primary, color: theme.dark ? theme.bg : '#fff', padding: big ? '10px 0' : '8px 0', flexShrink: 0 }}>
      <div style={{ display: 'inline-flex', gap: 44, whiteSpace: 'nowrap', animation: 'tabla-tkr 26s linear infinite', paddingInlineStart: '100%' }}>
        {[...list, ...list].map((o, i) => <span key={i} style={{ fontSize: 13, fontWeight: 600 }}>{o}</span>)}
      </div>
    </div>
  );
}

export function CatBar({ theme, cats, cat, setCat }: { theme: EffectiveTheme; cats: ReadonlyArray<Category>; cat: string; setCat: (id: string) => void }): React.JSX.Element {
  return (
    <div className="no-bar" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 18px' }}>
      {cats.map((c) => {
        const on = c.id === cat;
        const pill = theme.radius >= 8;
        return (
          <button key={c.id} onClick={() => setCat(c.id)} style={{ flexShrink: 0, padding: pill ? '7px 15px' : '7px 4px', borderRadius: pill ? 999 : 0,
            borderWidth: pill ? (on ? 0 : 1) : 0, borderStyle: 'solid', borderColor: theme.border,
            borderBottomWidth: pill ? (on ? 0 : 1) : 2, borderBottomColor: pill ? theme.border : (on ? theme.primary : 'transparent'),
            background: pill ? (on ? theme.primary : 'transparent') : 'transparent',
            color: pill ? (on ? (theme.dark ? theme.bg : '#fff') : theme.soft) : (on ? theme.primary : theme.soft),
            fontFamily: theme.serif ? theme.display : theme.body, fontStyle: theme.serif ? 'italic' : 'normal',
            fontWeight: on ? 700 : 500, fontSize: theme.serif ? 16 : 13, cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: theme.serif ? '0.01em' : 0 }}>{c.name}</button>
        );
      })}
    </div>
  );
}

export function Hero({ theme, t, lang, big = false }: { theme: EffectiveTheme; t: Copy; lang: Lang; big?: boolean }): React.JSX.Element {
  return (
    <div style={{ padding: big ? '34px 32px 22px' : '26px 22px 16px', textAlign: 'center' }}>
      <div style={{ fontFamily: theme.display, fontSize: 11, color: theme.soft, letterSpacing: theme.serif ? '0.25em' : '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{lang === 'en' ? 'EST · 2018' : 'منذ ٢٠١٨'}</div>
      <h1 style={{ margin: 0, fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: big ? 46 : 34, lineHeight: 1.05, letterSpacing: theme.serif ? '0.01em' : '-0.025em', color: theme.text }}>{t.name}</h1>
      <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.soft, letterSpacing: '0.04em' }}>
        {theme.serif && <span style={{ width: 14, height: 1, background: theme.primary }} />}
        {t.tagline}
        {theme.serif && <span style={{ width: 14, height: 1, background: theme.primary }} />}
      </div>
    </div>
  );
}

interface TopBarProps {
  theme: EffectiveTheme; feat: FeatureFlags; t: Copy; lang: Lang; setLang: (l: Lang) => void;
  query: string; setQuery: (q: string) => void; count: number; setShowCart: (open: boolean) => void;
}

export function TopBar({ theme, feat, t, lang, setLang, query, setQuery, count, setShowCart }: TopBarProps): React.JSX.Element {
  const [searching, setSearching] = useState(false);
  const btn = { width: 38, height: 38, borderRadius: theme.radius >= 12 ? 19 : theme.radius, border: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: theme.text, flexShrink: 0 } as const;
  return (
    <div style={{ padding: '16px 18px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
      {feat.search && (searching ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, height: 38, padding: '0 12px', borderRadius: theme.radius >= 12 ? 19 : theme.radius, border: `1px solid ${theme.border}`, background: theme.surface }}>
          <StoreIcon name="search" size={15} color={theme.soft} />
          <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: theme.text }} />
          <button onClick={() => { setSearching(false); setQuery(''); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: theme.soft, display: 'flex' }}><StoreIcon name="x" size={15} /></button>
        </div>
      ) : (
        <button onClick={() => setSearching(true)} style={btn}><StoreIcon name="search" size={16} /></button>
      ))}
      <div style={{ flex: 1 }} />
      {feat.multiLang && (
        <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ ...btn, width: 'auto', padding: '0 14px', fontFamily: 'inherit', fontSize: 12, fontWeight: 700 }}>{lang === 'ar' ? 'EN' : 'عربي'}</button>
      )}
      {feat.cart && count > 0 && (
        <button onClick={() => setShowCart(true)} style={{ ...btn, width: 'auto', padding: '0 12px', gap: 7, background: theme.primary, color: theme.dark ? theme.bg : '#fff', border: 'none', fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: 13 }}>
          <StoreIcon name="cart" size={15} stroke={2} />{count}
        </button>
      )}
    </div>
  );
}
