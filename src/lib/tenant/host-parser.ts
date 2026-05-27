import { RESERVED_SUBDOMAINS } from '@/config/constants';

export interface ParsedHost {
  /** Tenant subdomain if any (excludes www and reserved). */
  subdomain: string | null;
  /** Whether the host is a reserved/system subdomain (e.g., app, admin). */
  reserved: boolean;
  /** Raw host without port. */
  host: string;
}

/**
 * Parse a host header against the configured root domain.
 * Returns the tenant subdomain (if any) and whether the subdomain is reserved.
 */
export function parseHost(rawHost: string, rootDomain: string): ParsedHost {
  const host = rawHost.toLowerCase().split(':')[0];
  const root = rootDomain.toLowerCase();

  if (host === root || host === `www.${root}`) {
    return { subdomain: null, reserved: false, host };
  }

  if (!host.endsWith(`.${root}`)) {
    return { subdomain: null, reserved: false, host };
  }

  const sub = host.slice(0, -1 - root.length);
  if (!sub) return { subdomain: null, reserved: false, host };

  if (RESERVED_SUBDOMAINS.has(sub)) {
    return { subdomain: null, reserved: true, host };
  }

  return { subdomain: sub, reserved: false, host };
}
