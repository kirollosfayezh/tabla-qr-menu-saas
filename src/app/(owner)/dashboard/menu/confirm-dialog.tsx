'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

/** Centered confirm dialog rendered in a portal to escape stacking contexts. */
export function ConfirmDialog(props: Props): React.JSX.Element | null {
  const { title, message, confirmLabel, cancelLabel, onConfirm, onCancel, destructive } = props;
  const target = typeof document === 'undefined' ? null : document.body;

  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  if (!target) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-[rgba(15,15,26,0.55)]"
      />
      <div className="relative z-[81] w-full max-w-md space-y-4 rounded-2xl bg-surface-base p-6 shadow-2xl">
        <h2 className="font-display text-xl font-semibold text-text-primary">{title}</h2>
        <p className="text-sm text-text-secondary">{message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    target,
  );
}
