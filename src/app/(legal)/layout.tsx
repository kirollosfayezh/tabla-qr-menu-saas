import Link from 'next/link';
import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

export default async function LegalLayout({ children }: { children: ReactNode }): Promise<React.JSX.Element> {
  const t = await getTranslations('legal');
  return (
    <div className="min-h-screen bg-surface-sunken">
      <header className="border-b border-border-subtle bg-surface-base">
        <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-display text-lg font-semibold text-text-primary">Tabla</Link>
          <ul className="flex gap-4 text-sm text-text-secondary">
            <li><Link href="/terms" className="hover:text-text-primary">{t('nav.terms')}</Link></li>
            <li><Link href="/privacy" className="hover:text-text-primary">{t('nav.privacy')}</Link></li>
            <li><Link href="/refunds" className="hover:text-text-primary">{t('nav.refunds')}</Link></li>
            <li><Link href="/cookies" className="hover:text-text-primary">{t('nav.cookies')}</Link></li>
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-10">
        <article className="prose prose-sm max-w-none rounded-2xl border border-border-subtle bg-surface-base p-8 shadow-sm sm:prose-base sm:p-10">
          {children}
        </article>
      </main>
    </div>
  );
}
