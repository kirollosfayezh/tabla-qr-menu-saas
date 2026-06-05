'use client';

// ── Tabla theme store — live, interactive menu view ─────────────────────────
// Layout adapts to the device; content adapts to the theme's tier features.
import { useMemo, useState } from 'react';
import { HandheldMenu, LaptopMenu } from './menu-layouts';
import { ItemDetail, CartOverlay } from './menu-overlays';
import { CATS, COPY, ITEMS } from './menu-content';
import { THEMES, featuresFor } from './store-data';
import type { ThemeKey } from './store-data';
import type { EffectiveTheme, ThemeOverride } from './store-customization';
import type { CartLine, DeviceKey, MenuShared } from './menu-types';
import type { DishItem, Lang } from './menu-content';

interface Props {
  themeKey: ThemeKey;
  device: DeviceKey;
  lang: Lang;
  setLang: (lang: Lang) => void;
  override?: ThemeOverride;
}

export function MenuView({ themeKey, device, lang, setLang, override }: Props): React.JSX.Element {
  const theme = useMemo<EffectiveTheme>(() => ({ ...THEMES[themeKey], ...(override ?? {}) }), [themeKey, override]);
  const feat = featuresFor(themeKey);
  const t = COPY[lang];
  const cats = CATS[lang];
  const rtl = lang === 'ar';

  const [cat, setCat] = useState(feat.featured ? 'feat' : 'mez');
  const [query, setQuery] = useState('');
  const [openItem, setOpenItem] = useState<DishItem | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [sent, setSent] = useState(false);

  // Transient state (cart, open item, query, category) is reset by remounting:
  // the parent keys MenuView on `themeKey + device`, so a fresh mount restores
  // correct initial state without a setState-in-effect.
  const items = useMemo<ReadonlyArray<DishItem>>(() => {
    if (feat.search && query.trim()) {
      const q = query.toLowerCase();
      return ITEMS.filter((i) => (i.en.name + i.ar.name + i.en.desc).toLowerCase().includes(q));
    }
    return ITEMS.filter((i) => i.cat === cat);
  }, [cat, query, feat.search]);

  const count = cart.reduce((s, c) => s + c.qty, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);

  const add = (item: DishItem, qty = 1, notes = ''): void => {
    setCart((c) => {
      const existing = c.find((x) => x.id === item.id && x.notes === notes);
      if (existing) return c.map((x) => (x === existing ? { ...x, qty: x.qty + qty } : x));
      return [...c, { id: item.id, qty, price: item.price, notes, hue: item.hue, en: item.en, ar: item.ar }];
    });
  };
  const setQtyFn = (id: number, delta: number): void =>
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x)).filter((x) => x.qty > 0));
  const checkout = (): void => {
    setSent(true);
    setTimeout(() => { setSent(false); setShowCart(false); setCart([]); }, 2600);
  };

  const shared: MenuShared = {
    theme, feat, t, lang, rtl, device, items, cat, setCat, cats, query, setQuery, openItem, setOpenItem,
    add, count, subtotal, showCart, setShowCart, cart, setQtyFn, checkout, sent, setLang,
  };

  return (
    <div dir={rtl ? 'rtl' : 'ltr'} style={{ width: '100%', height: '100%', fontFamily: theme.body, color: theme.text, background: theme.bg, position: 'relative', overflow: 'hidden', transition: 'background .35s ease, color .35s ease' }}>
      {device === 'laptop' ? <LaptopMenu {...shared} /> : <HandheldMenu {...shared} />}
      {feat.itemDetail && <ItemDetail {...shared} />}
      {feat.cart && <CartOverlay {...shared} />}
    </div>
  );
}
