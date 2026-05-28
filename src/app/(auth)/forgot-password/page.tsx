import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata = { title: 'Reset password · Tabla' };

export default async function ForgotPasswordPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('auth');
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-text-primary">{t('resetPassword')}</h1>
        <p className="text-sm text-text-secondary">{t('resetHint')}</p>
      </header>
      <ForgotPasswordForm />
      <Link href="/login" className="inline-block text-sm font-medium text-brand-primary hover:underline">
        ← {t('backToLogin')}
      </Link>
    </div>
  );
}
