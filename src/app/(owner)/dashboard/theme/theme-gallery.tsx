'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { Theme } from '@prisma/client';
import { checkoutThemeAction } from '@/app/actions/payment.actions';

interface Props {
  themes: Theme[];
  currentThemeId: string | null;
  currencyCode: string;
  locale: 'en' | 'ar';
}

export function ThemeGallery({ themes, currentThemeId, currencyCode, locale }: Props): React.JSX.Element {
  const t = useTranslations('owner.theme');
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onMessage(event: MessageEvent): void {
      if (event.origin === window.location.origin && event.data?.type === 'tabla:payment-return') {
        window.location.reload();
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <div className="space-y-4">
      {error ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {themes.map((theme) => (
          <article key={theme.id} className="rounded-2xl border border-border-subtle bg-surface-base p-5 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-text-primary">
                  {locale === 'ar' && theme.nameAr ? theme.nameAr : theme.name}
                </h2>
                {theme.id === currentThemeId ? <span className="text-xs font-semibold text-green-700">{t('current')}</span> : null}
              </div>
              <p className="min-h-10 text-sm text-text-secondary">
                {locale === 'ar' && theme.descriptionAr ? theme.descriptionAr : theme.description}
              </p>
              <p className="text-sm font-semibold text-text-primary">
                {theme.isFree ? t('free') : price(theme.priceCents, currencyCode, locale)}
              </p>
            </div>
            <ThemeActions
              theme={theme}
              currentThemeId={currentThemeId}
              pendingId={pendingId}
              isPending={isPending}
              onCheckout={(method) => {
                const popup = theme.isFree ? null : openBlankPopup();
                startCheckout(theme.id, method, popup, startTransition, setPendingId, setError);
              }}
            />
          </article>
        ))}
      </div>
    </div>
  );
}

function startCheckout(
  themeId: string,
  method: 'card' | 'applePay',
  popup: Window | null,
  startTransition: (callback: () => void) => void,
  setPendingId: (value: string | null) => void,
  setError: (value: string) => void,
): void {
  setPendingId(themeId);
  setError('');
  startTransition(() => {
    void checkout(themeId, method, popup, setError, setPendingId);
  });
}

async function checkout(
  themeId: string,
  method: 'card' | 'applePay',
  popup: Window | null,
  setError: (value: string) => void,
  setPendingId: (value: string | null) => void,
): Promise<void> {
  const result = await checkoutThemeAction({ themeId, method });
  setPendingId(null);
  if (!result.ok) {
    popup?.close();
    setError(result.message);
    return;
  }
  if (result.value.redirectUrl) openPopup(result.value.redirectUrl, popup);
  else window.location.reload();
}

function ThemeActions({
  theme,
  currentThemeId,
  pendingId,
  isPending,
  onCheckout,
}: {
  theme: Theme;
  currentThemeId: string | null;
  pendingId: string | null;
  isPending: boolean;
  onCheckout: (method: 'card' | 'applePay') => void;
}): React.JSX.Element {
  const t = useTranslations('owner.theme');
  const disabled = theme.id === currentThemeId || isPending;
  const label = pendingId === theme.id && isPending ? t('processing') : theme.isFree ? t('activate') : t('buy');
  return (
    <div className="mt-5 space-y-2">
      <button type="button" disabled={disabled} onClick={() => onCheckout('card')} className="w-full rounded-lg bg-text-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-45">
        {label}
      </button>
      {!theme.isFree ? (
        <button type="button" disabled={disabled} onClick={() => onCheckout('applePay')} className="w-full rounded-lg border border-border-subtle px-4 py-2.5 text-sm font-semibold text-text-primary disabled:opacity-45">
          {t('applePay')}
        </button>
      ) : null}
    </div>
  );
}

function openBlankPopup(): Window | null {
  return window.open('', 'tabla-paymob', 'width=460,height=720,noopener,noreferrer');
}

function openPopup(url: string, popup: Window | null): void {
  if (popup) {
    popup.location.href = url;
    popup.focus();
    return;
  }
  const opened = window.open(url, 'tabla-paymob', 'width=460,height=720,noopener,noreferrer');
  if (!opened) window.location.href = url;
}

function price(cents: number, currencyCode: string, locale: 'en' | 'ar'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(cents / 100);
}
