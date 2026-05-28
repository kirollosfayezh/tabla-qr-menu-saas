'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { setLocaleCookie } from '@/app/actions/locale.action';
import { cn } from '@/lib/cn';

/** Two-pill EN / AR language switcher. Active locale is highlighted. */
export function LanguageSwitcher(): React.JSX.Element {
  const locale = useLocale();
  const [pending, start] = useTransition();

  function switchTo(next: string): void {
    if (next === locale) return;
    start(() => setLocaleCookie(next));
  }

  return (
    <div
      className="flex items-center rounded-full border border-border-subtle bg-surface-raised p-0.5"
      role="group"
      aria-label="Language"
    >
      <LangPill
        label="EN"
        active={locale === 'en'}
        disabled={pending}
        onClick={() => switchTo('en')}
      />
      <LangPill
        label="عر"
        active={locale === 'ar'}
        disabled={pending}
        onClick={() => switchTo('ar')}
      />
    </div>
  );
}

interface PillProps {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}

function LangPill({ label, active, disabled, onClick }: PillProps): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-7 rounded-full px-3 text-xs font-semibold transition',
        active
          ? 'bg-white text-text-primary shadow-sm'
          : 'text-text-tertiary hover:text-text-secondary',
      )}
    >
      {label}
    </button>
  );
}
