'use client';

import { useEffect } from 'react';
import { emitAnalyticsEvent } from '@/lib/analytics/emit';

/** Fires a single PAGE_VIEW analytics event when the diner page mounts. */
export function PageViewBeacon({ restaurantId }: { restaurantId: string }): null {
  useEffect(() => {
    emitAnalyticsEvent({ restaurantId, eventType: 'PAGE_VIEW' });
  }, [restaurantId]);
  return null;
}
