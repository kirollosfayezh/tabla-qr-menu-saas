/**
 * Strict security headers applied via middleware to every response.
 *
 * Notes:
 * - In development we relax script-src with `'unsafe-eval'` and `'unsafe-inline'`
 *   because Next.js dev runtime uses eval() and inlined bootstrap scripts for HMR.
 *   Production keeps a strict nonce-based policy.
 * - Cloudflare Turnstile is whitelisted (script + iframe).
 * - Google OAuth needs accounts.google.com / apis.google.com / gstatic.com.
 */
export interface BuildHeadersOptions {
  nonce: string;
  isDev: boolean;
}

const CF_CHALLENGES = 'https://challenges.cloudflare.com';
const GOOGLE_ACCOUNTS = 'https://accounts.google.com';
const GOOGLE_APIS = 'https://apis.google.com';
const GOOGLE_GSTATIC = 'https://www.gstatic.com';
const PAYMOB = 'https://accept.paymob.com https://accept.paymobsolutions.com';

export function buildSecurityHeaders({ nonce, isDev }: BuildHeadersOptions): Record<string, string> {
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-eval' 'unsafe-inline' ${CF_CHALLENGES} ${GOOGLE_ACCOUNTS} ${GOOGLE_APIS} ${GOOGLE_GSTATIC}`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${CF_CHALLENGES} ${GOOGLE_ACCOUNTS} ${GOOGLE_APIS} ${GOOGLE_GSTATIC}`;

  const csp = [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https:`,
    `connect-src 'self' https://*.upstash.io ${CF_CHALLENGES} ${GOOGLE_ACCOUNTS} ${PAYMOB}`,
    `frame-src 'self' ${CF_CHALLENGES} ${GOOGLE_ACCOUNTS} ${PAYMOB}`,
    `worker-src 'self' blob:`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self' ${GOOGLE_ACCOUNTS}`,
    `frame-ancestors 'none'`,
    !isDev ? `upgrade-insecure-requests` : null,
  ]
    .filter(Boolean)
    .join('; ');

  return {
    'content-security-policy': csp,
    'strict-transport-security': isDev
      ? 'max-age=0'
      : 'max-age=63072000; includeSubDomains; preload',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
    'x-dns-prefetch-control': 'on',
  };
}

/** Generate a cryptographically random nonce for CSP. */
export function generateNonce(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return btoa(String.fromCharCode(...arr));
}
