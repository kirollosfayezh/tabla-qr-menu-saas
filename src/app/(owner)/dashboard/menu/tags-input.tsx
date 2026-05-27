'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  id: string;
  values: ReadonlyArray<string>;
  placeholder?: string;
  onChange: (next: string[]) => void;
}

/** Chip-style multi-value input. Enter or comma commits a tag. */
export function TagsInput({ id, values, placeholder, onChange }: Props): React.JSX.Element {
  const [draft, setDraft] = useState('');

  function commit(): void {
    const cleaned = draft.trim().replace(/,$/, '').trim();
    if (!cleaned) return;
    if (values.includes(cleaned)) {
      setDraft('');
      return;
    }
    onChange([...values, cleaned]);
    setDraft('');
  }

  function remove(idx: number): void {
    onChange(values.filter((_, i) => i !== idx));
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && values.length > 0) {
      remove(values.length - 1);
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-11 flex-wrap items-center gap-1.5 rounded-lg border border-border-default bg-surface-base px-2 py-1.5',
        'focus-within:border-brand-primary',
      )}
    >
      {values.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-surface-raised px-2.5 py-0.5 text-xs text-text-primary"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => remove(i)}
            className="text-text-tertiary hover:text-danger"
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        placeholder={values.length === 0 ? placeholder : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKey}
        onBlur={commit}
        className="min-w-[120px] flex-1 bg-transparent text-sm text-text-primary focus:outline-none"
      />
    </div>
  );
}
