'use client';

import type { PaymentMethodId } from '@/lib/payments/payment-methods';

interface Props {
  planName: string;
  availableMethods: ReadonlyArray<PaymentMethodId>;
  onSelect: (method: PaymentMethodId) => void;
  onClose: () => void;
  pending: boolean;
}

const METHODS: ReadonlyArray<{ id: PaymentMethodId; label: string; sub: string; icon: React.JSX.Element }> = [
  {
    id: 'card',
    label: 'Credit / Debit Card',
    sub: 'Visa, Mastercard, Meeza',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 9h20" stroke="currentColor" strokeWidth="1.6" />
        <rect x="5" y="14" width="4" height="2" rx="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'applePay',
    label: 'Apple Pay',
    sub: 'Touch ID or Face ID',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M17.05 12.01c-.02-1.96 1.6-2.9 1.67-2.95-0.91-1.33-2.33-1.51-2.84-1.53-1.21-.12-2.37.71-2.99.71-.62 0-1.57-.69-2.58-.67-1.33.02-2.56.77-3.24 1.96-1.38 2.39-.36 5.93.99 7.87.66.95 1.44 2.02 2.47 1.98.99-.04 1.36-.64 2.56-.64 1.19 0 1.53.64 2.56.62 1.07-.02 1.74-.97 2.39-1.93.75-1.1 1.06-2.17 1.08-2.23-.02-.01-2.07-.8-2.07-3.19z" />
        <path d="M15.1 6.44c.55-.67.92-1.59.82-2.52-.79.03-1.75.53-2.31 1.19-.51.59-.95 1.53-.83 2.44.88.07 1.78-.44 2.32-1.11z" />
      </svg>
    ),
  },
  {
    id: 'instapay',
    label: 'InstaPay',
    sub: 'Manual — admin activates within 24 h',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="5" y="5" width="4" height="4" rx="0.5" fill="currentColor" />
        <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="15" y="5" width="4" height="4" rx="0.5" fill="currentColor" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <rect x="5" y="15" width="4" height="4" rx="0.5" fill="currentColor" />
        <path d="M13 13h2v2h-2zM17 13h4M17 17h4M13 17h2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function PaymentMethodSheet({ planName, availableMethods, onSelect, onClose, pending }: Props): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-border-subtle bg-surface-base p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-text-primary">Choose payment method</h2>
            <p className="mt-0.5 text-sm text-text-secondary">{planName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-text-tertiary hover:text-text-primary" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div className="space-y-2">
          {METHODS.filter((m) => availableMethods.includes(m.id)).map((m) => (
            <button
              key={m.id}
              type="button"
              disabled={pending}
              onClick={() => onSelect(m.id)}
              className="flex w-full items-center gap-4 rounded-xl border border-border-subtle bg-surface-raised px-4 py-3.5 text-start transition hover:border-brand-primary hover:bg-brand-primary-soft/20 disabled:opacity-50"
            >
              <span className="text-text-secondary">{m.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{m.label}</p>
                <p className="text-xs text-text-tertiary">{m.sub}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-text-tertiary" aria-hidden>
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
          {availableMethods.length === 0 ? (
            <p className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3 text-sm text-text-tertiary">
              No payment methods are available right now.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
