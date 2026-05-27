'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

/** Translates the ?error=... param NextAuth appends after a failed OAuth flow. */
export function OAuthErrorBanner(): React.JSX.Element | null {
  const params = useSearchParams();
  const t = useTranslations('auth');
  const code = params.get('error');
  if (!code) return null;

  const message = mapErrorCode(code, t);
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
    >
      {message}
    </div>
  );
}

type Translator = (key: string) => string;

function mapErrorCode(code: string, t: Translator): string {
  switch (code) {
    case 'OAuthAccountNotLinked':
      return t('oauthLinkConflict');
    case 'AccessDenied':
      return t('oauthAccessDenied');
    case 'Configuration':
      return t('oauthConfiguration');
    case 'Verification':
      return t('oauthVerification');
    default:
      return t('oauthGeneric');
  }
}
