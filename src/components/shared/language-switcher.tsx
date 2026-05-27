'use client';

import { useTransition } from 'react';
import { useLocale } from 'next-intl';
import { setLocaleCookie } from '@/app/actions/locale.action';

/** Toggles the active UI locale between English and Arabic. */
export function LanguageSwitcher(): React.JSX.Element {
  const locale = useLocale();
  const [pending, start] = useTransition();
  const next = locale === 'ar' ? 'en' : 'ar';
  const label = locale === 'ar' ? 'English' : 'العربية';

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => setLocaleCookie(next))}
      className="rounded-full border border-border-default px-3.5 h-9 text-xs font-medium text-text-secondary transition hover:bg-surface-raised"
      aria-label="Switch language"
    >
      {label}
    </button>
  );
}
