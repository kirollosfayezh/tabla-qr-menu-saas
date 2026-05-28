/**
 * Diner-side analytics emitter.
 * - Uses navigator.sendBeacon when available (non-blocking, survives page unload).
 * - Falls back to keepalive fetch.
 * - Generates a per-tab sessionId stored in sessionStorage; never sends raw IP / UA.
 */

const SESSION_KEY = 'tabla.analytics.sid';
const ENDPOINT = '/api/analytics/event';

export type AnalyticsEventType = 'PAGE_VIEW' | 'ITEM_VIEW' | 'ORDER_INITIATED' | 'WHATSAPP_REDIRECT';

export interface EmitInput {
  restaurantId: string;
  eventType: AnalyticsEventType;
  metadata?: Record<string, string | number | boolean | null>;
}

function ensureSessionId(): string {
  if (typeof window === 'undefined') return '';
  const cached = window.sessionStorage.getItem(SESSION_KEY);
  if (cached) return cached;
  const sid = randomId();
  window.sessionStorage.setItem(SESSION_KEY, sid);
  return sid;
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function emitAnalyticsEvent(input: EmitInput): void {
  if (typeof window === 'undefined') return;
  const payload = JSON.stringify({
    restaurantId: input.restaurantId,
    eventType: input.eventType,
    sessionId: ensureSessionId(),
    metadata: input.metadata,
  });

  try {
    if ('sendBeacon' in navigator) {
      const blob = new Blob([payload], { type: 'application/json' });
      const ok = navigator.sendBeacon(ENDPOINT, blob);
      if (ok) return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => undefined);
}
