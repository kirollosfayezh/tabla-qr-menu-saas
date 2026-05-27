import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

/** Split-screen layout for sign-up, sign-in, password reset. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <FormColumn>{children}</FormColumn>
      <PromoColumn />
    </div>
  );
}

function FormColumn({ children }: { children: ReactNode }): React.JSX.Element {
  const t = useTranslations('common');
  return (
    <section className="flex flex-col bg-surface-base">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="font-display text-xl font-semibold text-text-primary">
          {t('appName')}
        </Link>
        <LanguageSwitcher />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </section>
  );
}

function PromoColumn(): React.JSX.Element {
  const t = useTranslations('common');
  return (
    <aside className="hidden bg-brand-accent text-white lg:flex lg:flex-col lg:justify-end lg:p-12">
      <div className="space-y-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
          {t('appName')}
        </p>
        <p className="max-w-md text-balance text-3xl font-semibold leading-tight">
          {t('tagline')}
        </p>
      </div>
    </aside>
  );
}
