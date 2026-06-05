// ── Tabla theme store — data layer (typed port of the design's themes-data) ──
// Tiers (Basic / Standard / Premium), per-tier feature flags, and the six themes
// mapped to tiers. Higher tiers are strict supersets, so a Premium theme
// genuinely does more than a Basic one — not just a different look.

export type TierKey = 'basic' | 'standard' | 'premium';
export type ThemeKey = 'classic' | 'garden' | 'modern' | 'omakase' | 'elegant' | 'street';
export type LayoutKind = 'list' | 'cards' | 'editorial';
export type FeatureKey =
  | 'photos'
  | 'offers'
  | 'search'
  | 'tags'
  | 'featured'
  | 'itemDetail'
  | 'multiLang'
  | 'cart'
  | 'ordering'
  | 'reviews';

export type FeatureFlags = Record<FeatureKey, boolean>;

export interface Tier {
  key: TierKey;
  name: string;
  price: number;
  tagline: string;
  accent: string;
  blurb: string;
  features: FeatureFlags;
}

export interface ThemeToken {
  key: ThemeKey;
  tier: TierKey;
  name: string;
  sub: string;
  bg: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  soft: string;
  border: string;
  display: string;
  body: string;
  radius: number;
  serif: boolean;
  dark: boolean;
  layout: LayoutKind;
}

export const FEATURE_KEYS: ReadonlyArray<FeatureKey> = [
  'photos', 'search', 'tags', 'featured', 'itemDetail', 'offers', 'multiLang', 'cart', 'ordering', 'reviews',
];

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  photos: 'Dish photos',
  offers: 'Offers / promo ticker',
  search: 'Search the menu',
  tags: 'Dietary tags & filters',
  featured: 'Featured · chef’s picks',
  itemDetail: 'Item detail + notes',
  multiLang: 'Arabic + English',
  cart: 'Live cart',
  ordering: 'WhatsApp ordering',
  reviews: 'Dish ratings',
};

const NO_FEATURES: FeatureFlags = {
  photos: false, offers: false, search: false, tags: false, featured: false,
  itemDetail: false, multiLang: false, cart: false, ordering: false, reviews: false,
};

export const TIERS: Record<TierKey, Tier> = {
  basic: {
    key: 'basic', name: 'Basic', price: 9, tagline: 'A clean digital menu', accent: '#6B7280',
    blurb: 'A beautiful, fast, scannable menu. Prices and descriptions, no clutter.',
    features: { ...NO_FEATURES },
  },
  standard: {
    key: 'standard', name: 'Standard', price: 19, tagline: 'A menu that sells', accent: '#FF6B35',
    blurb: 'Photos, categories, search and chef’s picks. Everything a guest needs to choose — view only.',
    features: { ...NO_FEATURES, photos: true, offers: true, search: true, tags: true, featured: true, itemDetail: true },
  },
  premium: {
    key: 'premium', name: 'Premium', price: 39, tagline: 'Order without a waiter', accent: '#C9A961',
    blurb: 'The full experience: bilingual, live cart, WhatsApp ordering, ratings and motion polish.',
    features: {
      photos: true, offers: true, search: true, tags: true, featured: true,
      itemDetail: true, multiLang: true, cart: true, ordering: true, reviews: true,
    },
  },
};

export const TIER_ORDER: ReadonlyArray<TierKey> = ['basic', 'standard', 'premium'];

export const THEMES: Record<ThemeKey, ThemeToken> = {
  classic: {
    key: 'classic', tier: 'basic', name: 'Classic', sub: 'Warm bistro list',
    bg: '#FFFBF5', surface: '#FFFFFF', primary: '#B8341F', secondary: '#F4E4C1',
    text: '#2A1810', soft: '#6B5440', border: '#E8DBC2',
    display: 'var(--font-fraunces), serif', body: '"Inter", sans-serif', radius: 14, serif: true, dark: false, layout: 'list',
  },
  garden: {
    key: 'garden', tier: 'basic', name: 'Garden', sub: 'Fresh & green',
    bg: '#FAF6F0', surface: '#FFFFFF', primary: '#1F5F3F', secondary: '#DFEEDF',
    text: '#1A2E1F', soft: '#5E7060', border: '#E0E8D8',
    display: 'var(--font-fraunces), serif', body: '"Inter", sans-serif', radius: 16, serif: true, dark: false, layout: 'list',
  },
  modern: {
    key: 'modern', tier: 'standard', name: 'Modern', sub: 'Bold photo cards',
    bg: '#FFFFFF', surface: '#F8F8F8', primary: '#1A1A1A', secondary: '#FF6B35',
    text: '#0A0A0A', soft: '#6B6B6B', border: '#ECECEC',
    display: 'var(--font-display), sans-serif', body: '"Inter", sans-serif', radius: 18, serif: false, dark: false, layout: 'cards',
  },
  omakase: {
    key: 'omakase', tier: 'standard', name: 'Omakase', sub: 'Editorial & refined',
    bg: '#F5F2EC', surface: '#FFFFFF', primary: '#1A1A1A', secondary: '#C8472C',
    text: '#1A1A1A', soft: '#7A7A7A', border: '#E5E0D6',
    display: 'var(--font-cormorant), serif', body: '"Inter", sans-serif', radius: 4, serif: true, dark: false, layout: 'editorial',
  },
  elegant: {
    key: 'elegant', tier: 'premium', name: 'Elegant', sub: 'Gold on midnight',
    bg: '#0F1419', surface: '#1A1F26', primary: '#C9A961', secondary: '#1F2937',
    text: '#F5E8C8', soft: '#9C8F6E', border: '#2A3038',
    display: 'var(--font-cormorant), serif', body: '"Inter", sans-serif', radius: 2, serif: true, dark: true, layout: 'cards',
  },
  street: {
    key: 'street', tier: 'premium', name: 'Street', sub: 'Neon & loud',
    bg: '#0A0A1F', surface: '#13132E', primary: '#FF2E63', secondary: '#FFD60A',
    text: '#FFFFFF', soft: '#9A9AC0', border: '#2A2A4A',
    display: 'var(--font-display), sans-serif', body: '"Inter", sans-serif', radius: 0, serif: false, dark: true, layout: 'cards',
  },
};

export const THEME_ORDER: ReadonlyArray<ThemeKey> = ['classic', 'garden', 'modern', 'omakase', 'elegant', 'street'];

/** Effective feature set for a theme, inherited from its tier. */
export function featuresFor(themeKey: ThemeKey): FeatureFlags {
  return { ...TIERS[THEMES[themeKey].tier].features };
}
