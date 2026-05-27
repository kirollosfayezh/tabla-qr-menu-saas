import Link from 'next/link';
import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { LoginForm } from '@/components/auth/login-form';
import { GoogleButton } from '@/components/auth/google-button';
import { OAuthErrorBanner } from '@/components/auth/oauth-error-banner';
import { Divider } from '@/components/ui/divider';

export const metadata = { title: 'Sign in · Tabla' };

/** Owner sign-in page. */
export default function LoginPage(): React.JSX.Element {
  const t = useTranslations('auth');
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-text-primary">
          {t('welcomeBack')}
        </h1>
        <p className="text-sm text-text-secondary">{t('loginSubtitle')}</p>
      </header>

      <Suspense fallback={null}>
        <OAuthErrorBanner />
      </Suspense>
      <GoogleButton />
      <Divider>{t('orContinueWithEmail')}</Divider>
      <LoginForm />

      <p className="text-center text-sm text-text-secondary">
        {t('noAccount')}{' '}
        <Link href="/signup" className="font-medium text-brand-primary hover:underline">
          {t('createAccount')}
        </Link>
      </p>
    </div>
  );
}
