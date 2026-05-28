import { getTranslations } from 'next-intl/server';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MarketingHero } from '@/components/marketing/marketing-hero';
import { MarketingFeatures } from '@/components/marketing/marketing-features';
import { MarketingHow } from '@/components/marketing/marketing-how';
import { MarketingThemes } from '@/components/marketing/marketing-themes';
import { MarketingPricing } from '@/components/marketing/marketing-pricing';
import { MarketingFaq } from '@/components/marketing/marketing-faq';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { WhatsAppFloat } from '@/components/marketing/whatsapp-float';
import { PlanRepository } from '@/repositories/plan.repository';
import Link from 'next/link';

export const metadata = {
  title: 'Tabla — QR menus that send orders to WhatsApp',
  description: 'Branded digital menus for restaurants. One scan. One tap. WhatsApp orders.',
};

export default async function HomePage(): Promise<React.JSX.Element> {
  const dbPrices = await new PlanRepository().listPublicPrices().catch(() => []);
  return (
    <>
      <MarketingNav />
      <main>
        <MarketingHero />
        <MarketingFeatures />
        <MarketingHow />
        <MarketingThemes />
        <MarketingPricing dbPrices={dbPrices} />
        <MarketingFaq />
        <CtaSection />
      </main>
      <MarketingFooter />
      <WhatsAppFloat />
    </>
  );
}

async function CtaSection(): Promise<React.JSX.Element> {
  const t = await getTranslations('marketing.cta');
  return (
    <section className="bg-brand-primary-soft py-24 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-[3.25rem]">
          {t('heading')}
        </h2>
        <Link
          href="/signup"
          className="mt-8 inline-flex h-14 items-center gap-2 rounded-full bg-brand-primary px-8 text-base font-semibold text-white shadow-lg transition hover:bg-brand-primary-dark hover:shadow-xl active:scale-[0.98]"
        >
          {t('button')}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M3.5 9h11M10 4.5l4.5 4.5-4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
