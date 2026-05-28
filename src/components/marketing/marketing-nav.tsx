import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

/** Sticky frosted-glass top nav. Section links are hash anchors for in-page smooth scroll. */
export async function MarketingNav(): Promise<React.JSX.Element> {
  const t = await getTranslations('marketing.nav');
  return (
    <nav
      className="sticky top-0 z-50 border-b border-border-subtle bg-white/85 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-3.5">
        <Link href="/" aria-label="Tabla home" className="shrink-0">
          <TablaWordmark />
        </Link>

        <div className="hidden items-center gap-7 text-sm font-medium text-text-secondary md:flex">
          <a href="#features" className="transition hover:text-text-primary">{t('features')}</a>
          <a href="#themes" className="transition hover:text-text-primary">{t('themes')}</a>
          <Link href="/pricing" className="transition hover:text-text-primary">{t('pricing')}</Link>
          <a href="#about" className="transition hover:text-text-primary">{t('about')}</a>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href="/login"
            className="hidden h-9 items-center rounded-full px-4 text-sm font-semibold text-text-primary transition hover:bg-surface-raised sm:inline-flex"
          >
            {t('login')}
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center rounded-full bg-brand-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-dark active:scale-[0.98]"
          >
            {t('start')}
          </Link>
        </div>
      </div>
    </nav>
  );
}

function TablaWordmark(): React.JSX.Element {
  return (
    <span className="font-display text-xl font-bold tracking-tight text-text-primary">
      Tabla
    </span>
  );
}
