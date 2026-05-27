import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { SignupForm } from '@/components/auth/signup-form';
import { GoogleButton } from '@/components/auth/google-button';
import { Divider } from '@/components/ui/divider';

export const metadata = { title: 'Sign up · Tabla' };

/** Owner sign-up page. */
export default function SignupPage(): React.JSX.Element {
  const t = useTranslations('auth');
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-text-primary">
          {t('createAccount')}
        </h1>
        <p className="text-sm text-text-secondary">{t('signupSubtitle')}</p>
      </header>

      <GoogleButton />
      <Divider>{t('orContinueWithEmail')}</Divider>
      <SignupForm />

      <p className="text-center text-sm text-text-secondary">
        {t('alreadyHaveAccount')}{' '}
        <Link href="/login" className="font-medium text-brand-primary hover:underline">
          {t('signIn')}
        </Link>
      </p>
    </div>
  );
}
