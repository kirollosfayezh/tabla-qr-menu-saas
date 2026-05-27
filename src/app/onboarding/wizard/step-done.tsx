'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface Props {
  url: string;
  pendingPayment: boolean;
}

/** Step 4 — success screen with the live URL and a placeholder QR. */
export function StepDone({ url, pendingPayment }: Props): React.JSX.Element {
  const t = useTranslations('onboarding.done');
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    `https://${url}`,
  )}`;

  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="font-display text-3xl font-semibold text-text-primary">{t('title')}</h2>
        <p className="mt-1 text-sm text-text-secondary">{t('subtitle')}</p>
      </div>

      <div className="mx-auto max-w-sm space-y-3 rounded-2xl border border-border-subtle bg-surface-base p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          {t('yourUrl')}
        </p>
        <a
          href={`https://${url}`}
          target="_blank"
          rel="noreferrer"
          className="break-all text-base font-medium text-brand-primary hover:underline"
        >
          {url}
        </a>

        <div className="flex flex-col items-center gap-2 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
            {t('qrPreview')}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt="QR preview" width={180} height={180} className="rounded-lg" />
          <p className="text-[11px] text-text-tertiary">{t('qrNote')}</p>
        </div>
      </div>

      {pendingPayment ? (
        <p className="text-sm text-warning">{t('pendingPayment')}</p>
      ) : null}

      <Link href="/dashboard">
        <Button>{t('cta')}</Button>
      </Link>
    </div>
  );
}
