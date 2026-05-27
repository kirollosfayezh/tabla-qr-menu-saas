'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { PAYMENT_RETURN_CLOSE_DELAY_MS } from '@/config/constants';

export function PaymobReturnClient(): React.JSX.Element {
  const t = useTranslations('payments.return');

  useEffect(() => {
    window.opener?.postMessage({ type: 'tabla:payment-return' }, window.location.origin);
    const timer = window.setTimeout(() => window.close(), PAYMENT_RETURN_CLOSE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-sunken px-4">
      <section className="w-full max-w-sm rounded-2xl bg-surface-base p-6 text-center shadow-sm">
        <h1 className="font-display text-2xl font-semibold text-text-primary">{t('title')}</h1>
        <p className="mt-2 text-sm text-text-secondary">{t('description')}</p>
        <button
          type="button"
          onClick={() => window.close()}
          className="mt-5 rounded-lg bg-text-primary px-4 py-2 text-sm font-semibold text-white"
        >
          {t('close')}
        </button>
      </section>
    </main>
  );
}
