import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

const LEGAL_HREFS: Record<string, string> = {
  Privacy: '/privacy', خصوصية: '/privacy', الخصوصية: '/privacy',
  Terms: '/terms', الشروط: '/terms',
  Cookies: '/cookies', 'ملفات تعريف الارتباط': '/cookies',
  Refunds: '/refunds', الاسترداد: '/refunds',
};

const PRODUCT_HREFS: Record<string, string> = {
  Pricing: '/pricing', الأسعار: '/pricing',
  Features: '#features', المميزات: '#features',
  Themes: '#themes', التصاميم: '#themes',
};

/** Site footer: brand-accent dark bg, 4-column layout, copyright + language. */
export async function MarketingFooter(): Promise<React.JSX.Element> {
  const t = await getTranslations('marketing.footer');
  const productLinks = t.raw('product.links') as string[];
  const companyLinks = t.raw('company.links') as string[];
  const legalLinks = t.raw('legal.links') as string[];
  return (
    <footer className="bg-brand-accent text-white">
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-16">
        <div className="grid gap-12 sm:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <span className="font-display text-xl font-bold tracking-tight">Tabla</span>
            <p className="mt-4 max-w-[280px] text-sm leading-relaxed text-white/60">{t('description')}</p>
          </div>
          <FooterColumn heading={t('product.heading')} links={productLinks} hrefs={PRODUCT_HREFS} />
          <FooterColumn heading={t('company.heading')} links={companyLinks} />
          <FooterColumn heading={t('legal.heading')} links={legalLinks} hrefs={LEGAL_HREFS} />
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-sm text-white/50">{t('copyright')}</p>
          <FooterLangSwitcher />
        </div>
      </div>
    </footer>
  );
}

/** Dark-themed two-pill EN / AR switcher for the footer. */
function FooterLangSwitcher(): React.JSX.Element {
  return (
    <div className="[&_div]:border-white/20 [&_div]:bg-white/10 [&_button[aria-pressed=true]]:bg-white/20 [&_button[aria-pressed=true]]:text-white [&_button]:text-white/60 [&_button:hover]:text-white">
      <LanguageSwitcher />
    </div>
  );
}

function FooterColumn({ heading, links, hrefs = {} }: { heading: string; links: string[]; hrefs?: Record<string, string> }): React.JSX.Element {
  return (
    <div>
      <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.1em] text-white/50">{heading}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => {
          const href = hrefs[link] ?? '#';
          return (
            <li key={link}>
              <Link href={href} className="text-sm text-white/80 transition hover:text-white">
                {link}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
