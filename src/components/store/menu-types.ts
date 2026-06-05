// ── Tabla theme store — shared prop contract for the live menu view ─────────
import type { EffectiveTheme } from './store-customization';
import type { FeatureFlags } from './store-data';
import type { Category, Copy, DishItem, Lang } from './menu-content';

export type DeviceKey = 'phone' | 'tablet' | 'laptop';

export interface CartLine {
  id: number;
  qty: number;
  price: number;
  notes: string;
  hue: number;
  en: { name: string; desc: string };
  ar: { name: string; desc: string };
}

/** Everything the layouts + overlays need, threaded down from MenuView. */
export interface MenuShared {
  theme: EffectiveTheme;
  feat: FeatureFlags;
  t: Copy;
  lang: Lang;
  rtl: boolean;
  device: DeviceKey;
  items: ReadonlyArray<DishItem>;
  cat: string;
  setCat: (id: string) => void;
  cats: ReadonlyArray<Category>;
  query: string;
  setQuery: (q: string) => void;
  openItem: DishItem | null;
  setOpenItem: (item: DishItem | null) => void;
  add: (item: DishItem, qty?: number, notes?: string) => void;
  count: number;
  subtotal: number;
  showCart: boolean;
  setShowCart: (open: boolean) => void;
  cart: ReadonlyArray<CartLine>;
  setQtyFn: (id: number, delta: number) => void;
  checkout: () => void;
  sent: boolean;
  setLang: (lang: Lang) => void;
}
