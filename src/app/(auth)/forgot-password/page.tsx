import Link from 'next/link';
import { useTranslations } from 'next-intl';

export const metadata = { title: 'Reset password · Tabla' };

/**
 * Placeholder forgot-password page.
 * Real email-link flow lands later with the Resend integration.
 */
export default function ForgotPasswordPage(): React.JSX.Element {
  const t = useTranslations('auth');
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold text-text-primary">
          {t('resetPassword')}
        </h1>
        <p className="text-sm text-text-secondary">{t('resetComingSoon')}</p>
      </header>
      <Link href="/login" className="text-sm font-medium text-brand-primary hover:underline">
        ← {t('backToLogin')}
      </Link>
    </div>
  );
}
