/** Compile-time constants shared across the app. */

export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'en';

export const RTL_LOCALES: ReadonlySet<SupportedLocale> = new Set(['ar']);

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MIN_LENGTH = 3;
export const SLUG_MAX_LENGTH = 40;

export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  'www', 'app', 'admin', 'api', 'auth', 'mail', 'assets', 'static',
  'cdn', 'help', 'docs', 'status', 'blog', 'about', 'pricing', 'support',
  'login', 'signup', 'dashboard', 'billing', 'payments', 'webhook', 'webhooks',
  'onboarding',
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_WA_URL_BYTES = 2048;
export const CART_MIN_QTY = 1;
export const CART_MAX_QTY = 99;
export const CART_MAX_LINES = 50;
export const PUBLIC_MENU_REVALIDATE_SECONDS = 60;
export const PAYMOB_PAYMENT_EXPIRATION_SECONDS = 3600;
export const PAYMENT_RETURN_CLOSE_DELAY_MS = 1200;
export const QR_DOWNLOAD_SIZE = 512;
export const QR_PDF_SIZE = 300;

export const TENANT_HEADER = 'x-tenant-slug';
export const LOCALE_HEADER = 'x-app-locale';
export const REQUEST_ID_HEADER = 'x-request-id';
