'use client';

import { useEffect } from 'react';

interface Props {
  message: string;
  tone?: 'error' | 'success';
  onDismiss: () => void;
  durationMs?: number;
}

/** Lightweight transient toast pinned to the bottom of the viewport. */
export function Toast({
  message,
  tone = 'error',
  onDismiss,
  durationMs = 4000,
}: Props): React.JSX.Element {
  useEffect(() => {
    const t = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(t);
  }, [onDismiss, durationMs]);

  const palette =
    tone === 'success'
      ? 'bg-success/15 text-success border-success/30'
      : 'bg-danger/15 text-danger border-danger/30';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto fixed bottom-6 start-1/2 -translate-x-1/2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg ${palette}`}
    >
      {message}
    </div>
  );
}
