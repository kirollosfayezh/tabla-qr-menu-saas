/** Owner dashboard navigation entries. i18n key → label, href → route. */
export interface NavItem {
  key: string;
  href: string;
  i18nKey: string;
  iconKey: NavIconKey;
}

export type NavIconKey =
  | 'home'
  | 'menu'
  | 'theme'
  | 'branding'
  | 'settings'
  | 'orders'
  | 'qr'
  | 'analytics'
  | 'billing'
  | 'recommendations'
  | 'account';

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { key: 'home',      href: '/dashboard',           i18nKey: 'nav.home',      iconKey: 'home' },
  { key: 'menu',      href: '/dashboard/menu',       i18nKey: 'nav.menu',      iconKey: 'menu' },
  { key: 'theme',     href: '/dashboard/theme',      i18nKey: 'nav.theme',     iconKey: 'theme' },
  { key: 'branding',  href: '/dashboard/branding',   i18nKey: 'nav.branding',  iconKey: 'branding' },
  { key: 'orders',    href: '/dashboard/orders',     i18nKey: 'nav.orders',    iconKey: 'orders' },
  { key: 'qr',        href: '/dashboard/qr',         i18nKey: 'nav.qr',        iconKey: 'qr' },
  { key: 'analytics', href: '/dashboard/analytics',  i18nKey: 'nav.analytics', iconKey: 'analytics' },
  { key: 'settings',  href: '/dashboard/settings',   i18nKey: 'nav.settings',  iconKey: 'settings' },
  { key: 'billing',         href: '/dashboard/billing',          i18nKey: 'nav.billing',          iconKey: 'billing' },
  { key: 'recommendations', href: '/dashboard/recommendations', i18nKey: 'nav.recommendations',  iconKey: 'recommendations' },
  { key: 'account',         href: '/dashboard/account',          i18nKey: 'nav.account',          iconKey: 'account' },
];
