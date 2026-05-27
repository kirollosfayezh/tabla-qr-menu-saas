import { NextRequest, NextResponse } from 'next/server';
import { parseHost } from '@/lib/tenant/host-parser';
import { buildSecurityHeaders, generateNonce } from '@/lib/security/headers';
import { limiters } from '@/lib/security/rate-limiter';
import { TENANT_HEADER, REQUEST_ID_HEADER, SLUG_REGEX } from '@/config/constants';
import { env } from '@/config/env';

/**
 * Edge middleware: tenant rewrite + rate limiting + security headers.
 *
 * Routing:
 *  - <sub>.root          → rewrite /  ->  /t/<sub>
 *  - root/<slug>/...     → rewrite    ->  /t/<slug>/...
 *  - reserved subdomains pass through (app, admin, api, etc.)
 *
 * Why `/t/<slug>` and not `/_tenant/<slug>`: in the Next.js App Router any
 * folder name starting with `_` is *private* and not registered as a route,
 * so a rewrite to `/_tenant/...` 404s and falls back to `/`.
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') ?? '';
  const { subdomain, reserved } = parseHost(host, env.APP_ROOT_DOMAIN);

  const requestId = crypto.randomUUID();
  const nonce = generateNonce();
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';

  // Lightweight global rate limit on every edge hit (cheap; backed by Upstash).
  const rl = await limiters.public.limit(`ip:${ip}`);
  if (!rl.success) {
    const retryAfter = Math.max(1, Math.ceil((rl.reset - Date.now()) / 1000));
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: { 'retry-after': String(retryAfter) },
    });
  }

  const subdomainRewrite = rewriteSubdomain(url, subdomain, reserved);
  if (subdomainRewrite) return finalize(NextResponse.rewrite(url), { requestId, nonce, tenant: subdomain });

  const tenant = rewritePathTenant(url, Boolean(subdomain), reserved);
  if (tenant) return finalize(NextResponse.rewrite(url), { requestId, nonce, tenant });

  return finalize(NextResponse.next(), { requestId, nonce, tenant: null });
}

function rewriteSubdomain(url: URL, subdomain: string | null, reserved: boolean): boolean {
  if (!subdomain || reserved) return false;
  const suffix = url.pathname === '/' ? '' : url.pathname;
  url.pathname = `/t/${subdomain}${suffix}`;
  return true;
}

function rewritePathTenant(url: URL, hasSubdomain: boolean, reserved: boolean): string | null {
  if (hasSubdomain || reserved) return null;
  const segments = url.pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (!first || !SLUG_REGEX.test(first) || isSystemPath(first)) return null;
  const rest = segments.slice(1).join('/');
  url.pathname = rest ? `/t/${first}/${rest}` : `/t/${first}`;
  return first;
}

/** Paths that must never be treated as tenant slugs. */
function isSystemPath(segment: string): boolean {
  const systemPaths = new Set([
    'api', 'admin', 'dashboard', 'login', 'signup', 'auth', 'onboarding', 't', 'o',
    'payments',
    'pricing', 'about', 'contact', 'terms', 'privacy', '_next',
    'favicon.ico', 'robots.txt', 'sitemap.xml',
  ]);
  return systemPaths.has(segment);
}

interface FinalizeOptions {
  requestId: string;
  nonce: string;
  tenant: string | null;
}

function finalize(res: NextResponse, opts: FinalizeOptions): NextResponse {
  const headers = buildSecurityHeaders({
    nonce: opts.nonce,
    isDev: env.NODE_ENV !== 'production',
  });
  for (const [k, v] of Object.entries(headers)) res.headers.set(k, v);
  res.headers.set(REQUEST_ID_HEADER, opts.requestId);
  res.headers.set('x-nonce', opts.nonce);
  if (opts.tenant) res.headers.set(TENANT_HEADER, opts.tenant);
  return res;
}

export const config = {
  matcher: [
    /*
     * Skip Next internals and static files; run on everything else.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
