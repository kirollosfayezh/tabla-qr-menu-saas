'use client';

import { useTranslations } from 'next-intl';

interface Props {
  messages: string[];
  onChange: (next: string[]) => void;
}

const PLACEHOLDER = [
  '🍷 Wine night every Tuesday — 20% off all bottles',
  '🎉 Free knafeh with any main, today',
  '🔥 Try our new Aleppo cherry kebab',
];

/** Editable list of promo ticker messages shown on the diner page. */
export function OffersEditor({ messages, onChange }: Props): React.JSX.Element {
  const t = useTranslations('owner.branding');

  function update(index: number, text: string): void {
    onChange(messages.map((m, i) => (i === index ? text : m)));
  }

  function remove(index: number): void {
    onChange(messages.filter((_, i) => i !== index));
  }

  function add(): void {
    if (messages.length >= 10) return;
    onChange([...messages, '']);
  }

  return (
    <section className="mt-6 rounded-2xl border border-border-subtle bg-surface-raised p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-text-primary">{t('offersTitle')}</h3>
          <p className="text-xs text-text-tertiary">{t('offersHint')}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={msg}
              onChange={(e) => update(i, e.target.value)}
              placeholder={PLACEHOLDER[i % PLACEHOLDER.length]}
              maxLength={120}
              className="h-9 flex-1 rounded-lg border border-border-default bg-surface-base px-3 text-sm outline-none focus:border-brand-primary"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-subtle text-text-tertiary transition hover:border-danger hover:text-danger"
              aria-label="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {messages.length < 10 && (
        <button
          type="button"
          onClick={add}
          className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
        >
          + {t('addOffer')}
        </button>
      )}
    </section>
  );
}
