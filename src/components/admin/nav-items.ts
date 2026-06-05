export type AdminNavKey =
  | 'home'
  | 'restaurants'
  | 'themes'
  | 'packages'
  | 'payments'
  | 'users'
  | 'analytics'
  | 'audit'
  | 'email'
  | 'support';

export interface AdminNavItem {
  key: AdminNavKey;
  href: string;
  i18nKey: string;
}

export const ADMIN_NAV_ITEMS: ReadonlyArray<AdminNavItem> = [
  { key: 'home',        href: '/admin',             i18nKey: 'nav.home' },
  { key: 'restaurants', href: '/admin/restaurants', i18nKey: 'nav.restaurants' },
  { key: 'themes',      href: '/admin/themes',      i18nKey: 'nav.themes' },
  { key: 'packages',    href: '/admin/packages',    i18nKey: 'nav.packages' },
  { key: 'payments',    href: '/admin/payments',    i18nKey: 'nav.payments' },
  { key: 'users',       href: '/admin/users',       i18nKey: 'nav.users' },
  { key: 'analytics',   href: '/admin/analytics',   i18nKey: 'nav.analytics' },
  { key: 'audit',       href: '/admin/audit',       i18nKey: 'nav.audit' },
  { key: 'email',       href: '/admin/email',       i18nKey: 'nav.email' },
  { key: 'support',     href: '/admin/support',     i18nKey: 'nav.support' },
];
