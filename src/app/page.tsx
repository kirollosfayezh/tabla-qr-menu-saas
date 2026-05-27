import { useTranslations } from 'next-intl';

/** Temporary landing page — replaced by full marketing site in Phase 1. */
export default function HomePage() {
  return <Landing />;
}

function Landing() {
  const t = useTranslations('common');
  const tm = useTranslations('marketing');
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-text-tertiary">
        {t('appName')}
      </p>
      <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-text-primary sm:text-6xl">
        {t('tagline')}
      </h1>
      <p className="mt-6 max-w-xl text-balance text-lg text-text-secondary">
        Phase 0 foundation is live. Marketing site, onboarding, dashboard, and themes ship in Phase 1.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <a
          href="/signup"
          className="inline-flex h-12 items-center rounded-full bg-brand-primary px-6 text-sm font-medium text-white shadow-md transition hover:bg-brand-primary-dark hover:shadow-lg active:scale-[0.98]"
        >
          {tm('ctaStart')}
        </a>
        <a
          href="/login"
          className="inline-flex h-12 items-center rounded-full border border-border-default bg-surface-base px-6 text-sm font-medium text-text-primary transition hover:bg-surface-raised"
        >
          {tm('ctaDemo')}
        </a>
      </div>
    </main>
  );
}
