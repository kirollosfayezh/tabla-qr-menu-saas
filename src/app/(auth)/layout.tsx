import type { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

/** Split-screen layout for sign-up, sign-in, password reset. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-base lg:grid lg:grid-cols-2">
      <FormColumn>{children}</FormColumn>
      <AuthHero className="hidden lg:flex" />
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
      <AuthHero className="mx-6 mb-8 flex min-h-[220px] overflow-hidden rounded-lg sm:mx-10 sm:min-h-[280px] lg:hidden" />
      <main className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10 lg:py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </section>
  );
}

function AuthHero({ className }: { className?: string }): React.JSX.Element {
  const t = useTranslations('common');
  return (
    <aside className={`relative isolate flex-col justify-end bg-text-primary text-white ${className ?? ''}`}>
      <video
        className="absolute inset-0 -z-10 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10 lg:bg-gradient-to-br lg:from-black/75 lg:via-black/25 lg:to-transparent" />
      <div className="space-y-3 p-6 sm:p-8 lg:space-y-4 lg:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-white/60">
          {t('appName')}
        </p>
        <p className="max-w-md text-balance text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
          {t('tagline')}
        </p>
      </div>
    </aside>
  );
}
