import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = { title: 'Set new password · Tabla' };

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResetPasswordPage({ params }: PageProps): Promise<React.JSX.Element> {
  const t = await getTranslations('auth');
  const { token } = await params;
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-text-primary">{t('setNewPassword')}</h1>
        <p className="text-sm text-text-secondary">{t('setNewPasswordHint')}</p>
      </header>
      <ResetPasswordForm token={token} />
      <Link href="/login" className="inline-block text-sm font-medium text-brand-primary hover:underline">
        ← {t('backToLogin')}
      </Link>
    </div>
  );
}
