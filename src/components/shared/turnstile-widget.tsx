'use client';

import { useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  /** Public site key — pulled from NEXT_PUBLIC_TURNSTILE_SITE_KEY by the parent. */
  siteKey: string;
  /** Optional action label (must match server expectedAction if used). */
  action?: string;
  /** Receives the token to submit alongside the form data. */
  onToken: (token: string) => void;
  /** Called when the widget expires or errors so the parent can disable submit. */
  onExpire?: () => void;
  /** Visual theme; defaults to auto (follows OS). */
  theme?: 'auto' | 'light' | 'dark';
}

interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      action?: string;
      callback: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
      'timeout-callback'?: () => void;
      theme?: 'auto' | 'light' | 'dark';
      retry?: 'auto' | 'never';
    },
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId?: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/**
 * Renders a Cloudflare Turnstile challenge.
 * Mounts exactly once per (siteKey, action, theme) — callbacks are kept in refs
 * so a parent re-render does NOT remount the widget (which would re-trigger the
 * challenge in a loop).
 */
export function TurnstileWidget({
  siteKey,
  action,
  onToken,
  onExpire,
  theme = 'auto',
}: TurnstileWidgetProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  const onExpireRef = useRef(onExpire);

  // Keep refs in sync with the latest callbacks without retriggering the mount effect.
  onTokenRef.current = onToken;
  onExpireRef.current = onExpire;

  useEffect(() => {
    let cancelled = false;

    const ensureScript = (): Promise<void> =>
      new Promise((resolve) => {
        if (window.turnstile) return resolve();
        const existing = document.querySelector<HTMLScriptElement>(`script[src^="${SCRIPT_SRC}"]`);
        if (existing) {
          existing.addEventListener('load', () => resolve(), { once: true });
          return;
        }
        const s = document.createElement('script');
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        document.head.appendChild(s);
      });

    void ensureScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      // Guard against StrictMode double-invocation.
      if (widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        action,
        theme,
        retry: 'auto',
        callback: (token) => onTokenRef.current(token),
        'expired-callback': () => onExpireRef.current?.(),
        'error-callback': () => onExpireRef.current?.(),
        'timeout-callback': () => onExpireRef.current?.(),
      });
    });

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, action, theme]);

  return <div ref={containerRef} />;
}
