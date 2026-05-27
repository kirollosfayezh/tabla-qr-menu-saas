'use client';

import { useEffect, useMemo, useState } from 'react';
import { checkSlugAction } from '@/app/actions/onboarding.actions';
import { SlugSchema } from '@/dtos/restaurant.dto';

export type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'reserved' | 'invalid';

interface RemoteResult {
  slug: string;
  status: SlugStatus;
}

/** Synchronously derive status from the slug alone (no network). */
function localStatus(slug: string): SlugStatus {
  if (!slug) return 'idle';
  const parsed = SlugSchema.safeParse(slug);
  if (parsed.success) return 'checking';
  const msg = parsed.error.issues[0]?.message ?? '';
  return msg.includes('reserved') ? 'reserved' : 'invalid';
}

/**
 * Debounced live availability check for a candidate slug.
 * Local validity is derived synchronously; the server is only consulted
 * for valid candidates after the debounce.
 */
export function useSlugCheck(slug: string, debounceMs = 400): SlugStatus {
  const derived = useMemo(() => localStatus(slug), [slug]);
  const [remote, setRemote] = useState<RemoteResult | null>(null);

  useEffect(() => {
    if (derived !== 'checking') return;
    const timer = setTimeout(async () => {
      const res = await checkSlugAction(slug);
      if (!res.ok) {
        setRemote({ slug, status: 'invalid' });
        return;
      }
      setRemote({
        slug,
        status: res.value.available
          ? 'available'
          : res.value.reason === 'reserved'
            ? 'reserved'
            : 'taken',
      });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [slug, derived, debounceMs]);

  return remote && remote.slug === slug ? remote.status : derived;
}
