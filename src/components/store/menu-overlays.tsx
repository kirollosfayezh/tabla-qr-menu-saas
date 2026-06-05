'use client';

// ── Tabla theme store — item detail + cart overlays ─────────────────────────
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { StoreIcon } from './store-icon';
import { FoodSlot, Stars, TagChips } from './menu-parts';
import type { MenuShared } from './menu-types';
import type { DishItem } from './menu-content';

/** Full item detail (Standard+: notes; Premium: add to cart). Slides up over the menu. */
export function ItemDetail({ theme, feat, t, lang, openItem, setOpenItem, add, device }: MenuShared): React.JSX.Element {
  const item = openItem;
  const wide = device === 'laptop';
  const panel: CSSProperties = wide
    ? { top: '50%', insetInlineStart: '50%', width: 560, maxWidth: '92%', maxHeight: '86%', borderRadius: theme.radius >= 12 ? 20 : theme.radius, transform: `translate(-50%,-50%) scale(${item ? 1 : 0.96})`, opacity: item ? 1 : 0, pointerEvents: item ? 'auto' : 'none', boxShadow: '0 40px 100px rgba(0,0,0,0.4)' }
    : { insetInlineStart: 0, insetInlineEnd: 0, bottom: 0, maxHeight: '92%', borderTopLeftRadius: theme.radius >= 12 ? 26 : 0, borderTopRightRadius: theme.radius >= 12 ? 26 : 0, transform: `translateY(${item ? '0' : '100%'})` };
  return (
    <>
      <div onClick={() => setOpenItem(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 40, opacity: item ? 1 : 0, pointerEvents: item ? 'auto' : 'none', transition: 'opacity .25s' }} />
      <div style={{ position: 'absolute', zIndex: 41, background: theme.bg, color: theme.text, overflow: 'hidden', transition: 'transform .34s cubic-bezier(.16,1,.3,1)', ...panel }}>
        {item && <ItemDetailBody key={item.id} theme={theme} feat={feat} t={t} lang={lang} item={item} wide={wide} setOpenItem={setOpenItem} add={add} />}
      </div>
    </>
  );
}

type ItemDetailBodyProps = Pick<MenuShared, 'theme' | 'feat' | 't' | 'lang' | 'setOpenItem' | 'add'> & { item: DishItem; wide: boolean };

/** Scrollable detail content. Keyed on item id by the parent, so qty/notes reset on open. */
function ItemDetailBody({ theme, feat, t, lang, item, wide, setOpenItem, add }: ItemDetailBodyProps): React.JSX.Element {
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  return (
          <div className="no-bar" style={{ maxHeight: wide ? '86vh' : '92vh', overflowY: 'auto', position: 'relative' }}>
            {feat.photos && (
              <div style={{ width: '100%', height: wide ? 240 : 280, position: 'relative' }}>
                <FoodSlot item={item} />
                {theme.dark && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${theme.bg})` }} />}
              </div>
            )}
            <button onClick={() => setOpenItem(null)} style={{ position: 'absolute', top: 16, insetInlineStart: 16, width: 38, height: 38, borderRadius: 19, border: 'none', background: theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: theme.text }}><StoreIcon name="x" size={17} /></button>
            <div style={{ padding: feat.photos ? '20px 24px 24px' : '52px 24px 24px' }}>
              {feat.featured && item.tags.includes('chefPick') && <div style={{ fontSize: 10, fontWeight: 800, color: theme.primary, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>★ {t.chefPick}</div>}
              <h2 style={{ margin: 0, fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: 28, letterSpacing: theme.serif ? '0.01em' : '-0.02em', lineHeight: 1.1 }}>{item[lang].name}</h2>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontFamily: 'var(--f-num)', fontWeight: 700, fontSize: 19, color: theme.primary }}>{item.price} {t.currency}</span>
                {feat.reviews && <Stars rating={item.rating} votes={item.votes} theme={theme} size={13} />}
              </div>
              <p style={{ marginTop: 16, fontSize: 14.5, lineHeight: 1.65, color: theme.soft, fontFamily: theme.serif ? theme.display : 'inherit', fontStyle: theme.serif ? 'italic' : 'normal' }}>{item[lang].desc}</p>
              {feat.tags && <div style={{ marginTop: 16 }}><TagChips item={item} theme={theme} t={t} showFeatured={feat.featured} /></div>}
              {feat.cart && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: theme.soft, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{t.notes}</div>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t.notesPh} style={{ width: '100%', minHeight: 56, padding: 12, borderRadius: theme.radius >= 12 ? 12 : theme.radius, border: `1px solid ${theme.border}`, fontFamily: 'inherit', fontSize: 13, background: theme.surface, color: theme.text, resize: 'none', boxSizing: 'border-box' }} />
                </div>
              )}
            </div>
            {feat.cart && (
              <div style={{ position: wide ? 'static' : 'sticky', bottom: 0, padding: '14px 24px 20px', background: theme.bg, borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', padding: 4, borderRadius: theme.radius >= 12 ? 24 : theme.radius, border: `1px solid ${theme.border}` }}>
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: 38, height: 44, border: 'none', background: 'transparent', color: theme.text, cursor: 'pointer' }}><StoreIcon name="minus" size={15} /></button>
                  <span style={{ width: 28, textAlign: 'center', fontWeight: 700, fontFamily: 'var(--f-num)', fontSize: 16 }}>{qty}</span>
                  <button onClick={() => setQty((q) => q + 1)} style={{ width: 38, height: 44, border: 'none', background: 'transparent', color: theme.text, cursor: 'pointer' }}><StoreIcon name="plus" size={15} /></button>
                </div>
                <button onClick={() => { add(item, qty, notes); setOpenItem(null); }} style={{ flex: 1, height: 52, borderRadius: theme.radius >= 12 ? 14 : theme.radius, border: 'none', background: theme.primary, color: theme.dark ? theme.bg : '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{t.addCart} · {item.price * qty} {t.currency}</button>
              </div>
            )}
          </div>
  );
}

/** Cart drawer + WhatsApp send confirmation (Premium only). */
export function CartOverlay({ theme, t, lang, cart, subtotal, showCart, setShowCart, setQtyFn, checkout, sent, device }: MenuShared): React.JSX.Element {
  const wide = device === 'laptop';
  const closedX = lang === 'ar' ? '-100%' : '100%';
  const panel = wide
    ? { top: 0, bottom: 0, insetInlineEnd: 0, width: 420, transform: `translateX(${showCart ? '0' : closedX})`, boxShadow: '-20px 0 60px rgba(0,0,0,0.3)' }
    : { insetInlineStart: 0, insetInlineEnd: 0, bottom: 0, maxHeight: '90%', borderTopLeftRadius: theme.radius >= 12 ? 26 : 0, borderTopRightRadius: theme.radius >= 12 ? 26 : 0, transform: `translateY(${showCart ? '0' : '100%'})` };
  return (
    <>
      <div onClick={() => setShowCart(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', zIndex: 50, opacity: showCart ? 1 : 0, pointerEvents: showCart ? 'auto' : 'none', transition: 'opacity .25s' }} />
      <div style={{ position: 'absolute', zIndex: 51, background: theme.bg, color: theme.text, display: 'flex', flexDirection: 'column', transition: 'transform .34s cubic-bezier(.16,1,.3,1)', ...panel }}>
        <div style={{ padding: '20px 22px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}` }}>
          <h2 style={{ margin: 0, fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: 22, letterSpacing: theme.serif ? '0.01em' : '-0.02em' }}>{lang === 'ar' ? 'طلبك' : 'Your order'}</h2>
          <button onClick={() => setShowCart(false)} style={{ width: 34, height: 34, borderRadius: 17, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.text }}><StoreIcon name="x" size={15} /></button>
        </div>
        <div className="no-bar" style={{ flex: 1, overflowY: 'auto', padding: '6px 22px' }}>
          {cart.length === 0 && <div style={{ padding: '60px 0', textAlign: 'center', color: theme.soft, fontSize: 14 }}>{lang === 'ar' ? 'سلتك فارغة' : 'Your order is empty'}</div>}
          {cart.map((c, i) => (
            <div key={`${c.id}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: `1px solid ${theme.border}` }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: theme.display, fontSize: 15, fontWeight: theme.serif ? 500 : 600 }}>{c[lang].name}</div>
                <div style={{ fontFamily: 'var(--f-num)', fontSize: 13, color: theme.primary, fontWeight: 700, marginTop: 2 }}>{c.price * c.qty} {t.currency}</div>
                {c.notes && <div style={{ fontSize: 11, color: theme.soft, marginTop: 2, fontStyle: 'italic' }}>“{c.notes}”</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 3, borderRadius: theme.radius >= 12 ? 18 : theme.radius, border: `1px solid ${theme.border}` }}>
                <button onClick={() => setQtyFn(c.id, -1)} style={{ width: 26, height: 26, borderRadius: theme.radius >= 12 ? 13 : 0, border: 'none', background: theme.secondary, color: theme.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><StoreIcon name="minus" size={11} stroke={2.4} /></button>
                <span style={{ width: 20, textAlign: 'center', fontWeight: 700, fontFamily: 'var(--f-num)', fontSize: 13 }}>{c.qty}</span>
                <button onClick={() => setQtyFn(c.id, 1)} style={{ width: 26, height: 26, borderRadius: theme.radius >= 12 ? 13 : 0, border: 'none', background: theme.primary, color: theme.dark ? theme.bg : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><StoreIcon name="plus" size={11} stroke={2.4} /></button>
              </div>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: '14px 22px 20px', borderTop: `1px solid ${theme.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, marginBottom: 12 }}><span>{t.total}</span><span style={{ fontFamily: 'var(--f-num)' }}>{subtotal} {t.currency}</span></div>
            <button onClick={checkout} style={{ width: '100%', height: 54, borderRadius: theme.radius >= 12 ? 14 : theme.radius, border: 'none', background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 12px 30px rgba(37,211,102,0.35)' }}><StoreIcon name="whatsapp" size={20} />{t.send}</button>
          </div>
        )}
        {sent && (
          <div style={{ position: 'absolute', inset: 0, background: theme.bg, zIndex: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
            <div style={{ width: 88, height: 88, borderRadius: 44, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 50px rgba(37,211,102,0.4)' }}><StoreIcon name="check" size={44} color="#fff" stroke={3} /></div>
            <h2 style={{ margin: '22px 0 0', fontFamily: theme.display, fontWeight: theme.serif ? 500 : 700, fontSize: 24 }}>{lang === 'ar' ? 'تم الإرسال!' : 'Sent!'}</h2>
            <p style={{ marginTop: 8, fontSize: 14, color: theme.soft, maxWidth: 260, lineHeight: 1.5 }}>{lang === 'ar' ? 'سيتواصل المطعم معك قريباً.' : 'The restaurant will follow up shortly.'}</p>
          </div>
        )}
      </div>
    </>
  );
}
