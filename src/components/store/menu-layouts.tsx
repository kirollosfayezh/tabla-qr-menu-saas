'use client';

// ── Tabla theme store — handheld + laptop menu layouts ──────────────────────
import { StoreIcon } from './store-icon';
import { CatBar, Hero, Ticker, TopBar } from './menu-chrome';
import { Dish } from './menu-parts';
import type { MenuShared } from './menu-types';

/** Phone + tablet layout. */
export function HandheldMenu(p: MenuShared): React.JSX.Element {
  const { theme, feat, t, lang, setLang, items, cat, setCat, cats, query, setQuery, setOpenItem, add, count, subtotal, setShowCart, device } = p;
  const twoCol = device === 'tablet' && theme.layout === 'cards';
  return (
    <div className="no-bar" style={{ width: '100%', height: '100%', overflowY: 'auto', paddingBottom: feat.cart && count > 0 ? 96 : 24 }}>
      <TopBar theme={theme} feat={feat} t={t} lang={lang} setLang={setLang} query={query} setQuery={setQuery} count={count} setShowCart={setShowCart} />
      <Hero theme={theme} t={t} lang={lang} />
      {feat.offers && <Ticker theme={theme} lang={lang} />}
      {!query && (
        <div style={{ position: 'sticky', top: 0, zIndex: 5, background: theme.bg, borderBottom: `1px solid ${theme.border}` }}>
          <CatBar theme={theme} cats={cats} cat={cat} setCat={setCat} />
        </div>
      )}
      <div style={{ padding: theme.layout === 'cards' ? '14px 18px' : '4px 18px' }}>
        {items.length === 0 && <div style={{ padding: '50px 0', textAlign: 'center', color: theme.soft, fontSize: 13 }}>{t.empty}</div>}
        <div className="tabla-dish-stagger" key={cat + query} style={theme.layout === 'cards' ? { display: 'grid', gridTemplateColumns: twoCol ? '1fr 1fr' : '1fr', gap: 14 } : undefined}>
          {items.map((it) => <Dish key={it.id} item={it} theme={theme} feat={feat} t={t} lang={lang} onOpen={setOpenItem} onAdd={add} />)}
        </div>
      </div>
      {!feat.cart && (
        <div style={{ margin: '8px 18px 24px', padding: 16, borderRadius: theme.radius, border: `1px solid ${theme.border}`, background: theme.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: 16, color: theme.text }}>{t.call}</div>
            <div style={{ fontSize: 12, color: theme.soft, fontFamily: 'var(--f-num)' }}>+20 100 123 4567</div>
          </div>
          <div style={{ width: 42, height: 42, borderRadius: 21, background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.dark ? theme.bg : '#fff' }}><StoreIcon name="call" size={18} /></div>
        </div>
      )}
      {feat.cart && count > 0 && (
        <div style={{ position: 'absolute', insetInlineStart: 16, insetInlineEnd: 16, bottom: 16, zIndex: 10 }}>
          <button onClick={() => setShowCart(true)} style={{ width: '100%', background: theme.primary, color: theme.dark ? theme.bg : '#fff', borderRadius: theme.radius >= 12 ? 16 : theme.radius, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 14px 36px rgba(0,0,0,0.22)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 15 }}>
              <span style={{ minWidth: 24, height: 24, borderRadius: 12, background: 'rgba(255,255,255,0.22)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontFamily: 'var(--f-num)' }}>{count}</span>
              {t.viewCart}
            </span>
            <span style={{ fontWeight: 700, fontSize: 15, fontFamily: 'var(--f-num)' }}>{subtotal} {t.currency}</span>
          </button>
        </div>
      )}
    </div>
  );
}

/** Laptop layout — header + sidebar + grid. */
export function LaptopMenu(p: MenuShared): React.JSX.Element {
  const { theme, feat, t, lang, setLang, items, cat, setCat, cats, query, setQuery, setOpenItem, add, count, subtotal, setShowCart } = p;
  const navBtn = { width: 36, height: 36, borderRadius: theme.radius >= 12 ? 18 : theme.radius, border: `1px solid ${theme.border}`, background: theme.surface, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: theme.text } as const;
  const heading = query ? `“${query}”` : (cats.find((c) => c.id === cat)?.name ?? '');
  const gridStyle = theme.layout === 'list'
    ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 48px' }
    : theme.layout === 'editorial'
      ? { maxWidth: 720 }
      : { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 };
  return (
    <div className="no-bar" style={{ width: '100%', height: '100%', overflowY: 'auto', background: theme.bg }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 6, background: theme.bg, borderBottom: `1px solid ${theme.border}`, padding: '0 40px', height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: theme.serif ? 20 : theme.radius, background: theme.secondary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: theme.display, fontWeight: theme.serif ? 500 : 800, fontSize: 22, color: theme.primary }}>{lang === 'ar' ? 'ن' : 'N'}</div>
          <div>
            <div style={{ fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: 22, lineHeight: 1, letterSpacing: theme.serif ? '0.01em' : '-0.02em', color: theme.text }}>{t.name}</div>
            <div style={{ fontSize: 11, color: theme.soft, marginTop: 3, letterSpacing: '0.04em' }}>{t.tagline}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {feat.search && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 240, height: 40, padding: '0 14px', borderRadius: theme.radius >= 12 ? 20 : theme.radius, border: `1px solid ${theme.border}`, background: theme.surface }}>
              <StoreIcon name="search" size={15} color={theme.soft} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 13, color: theme.text }} />
            </div>
          )}
          {feat.multiLang && <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} style={{ ...navBtn, width: 'auto', padding: '0 14px', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>{lang === 'ar' ? 'EN' : 'عربي'}</button>}
          {feat.cart && (
            <button onClick={() => setShowCart(true)} style={{ ...navBtn, width: 'auto', padding: '0 16px', gap: 8, background: theme.primary, color: theme.dark ? theme.bg : '#fff', border: 'none', fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: 14 }}>
              <StoreIcon name="cart" size={16} stroke={2} />{count > 0 ? `${count} · ${subtotal} ${t.currency}` : t.viewCart}
            </button>
          )}
        </div>
      </header>
      {feat.offers && <Ticker theme={theme} lang={lang} big />}
      <div style={{ display: 'flex', alignItems: 'flex-start', maxWidth: 1180, margin: '0 auto', padding: '0 24px' }}>
        {!query && (
          <aside style={{ position: 'sticky', top: 92, alignSelf: 'flex-start', width: 200, flexShrink: 0, padding: '32px 16px 32px 0' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: theme.soft, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14, paddingInlineStart: 12 }}>{t.menu}</div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {cats.map((c) => {
                const on = c.id === cat;
                return (
                  <button key={c.id} onClick={() => setCat(c.id)} style={{ textAlign: lang === 'ar' ? 'right' : 'left', padding: '11px 14px', borderRadius: theme.radius >= 12 ? 12 : theme.radius, border: 'none', cursor: 'pointer',
                    background: on ? (theme.dark ? theme.surface : theme.secondary) : 'transparent',
                    color: on ? theme.primary : theme.soft, fontFamily: theme.serif ? theme.display : theme.body, fontStyle: theme.serif ? 'italic' : 'normal',
                    fontWeight: on ? 700 : 500, fontSize: theme.serif ? 18 : 14, letterSpacing: theme.serif ? '0.01em' : 0, transition: 'all .15s' }}>{c.name}</button>
                );
              })}
            </nav>
          </aside>
        )}
        <main style={{ flex: 1, minWidth: 0, padding: '32px 0 64px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: 30, letterSpacing: theme.serif ? '0.01em' : '-0.025em', color: theme.text }}>{heading}</h2>
            <span style={{ fontSize: 13, color: theme.soft, fontFamily: 'var(--f-num)' }}>{items.length} {lang === 'ar' ? 'صنف' : 'items'}</span>
          </div>
          {items.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: theme.soft }}>{t.empty}</div>
          ) : (
            <div className="tabla-dish-stagger" key={cat + query} style={gridStyle}>
              {items.map((it) => <Dish key={it.id} item={it} theme={theme} feat={feat} t={t} lang={lang} onOpen={setOpenItem} onAdd={add} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
