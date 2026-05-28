import { getTranslations } from 'next-intl/server';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { PricingPageContent } from '@/components/marketing/pricing-page-content';
import { MarketingFaq } from '@/components/marketing/marketing-faq';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { PlanRepository } from '@/repositories/plan.repository';

export async function generateMetadata() {
  const t = await getTranslations('marketing.pricing');
  return {
    title: `${t('heading')} · Tabla`,
    description: t('sub'),
  };
}

export default async function PricingPage(): Promise<React.JSX.Element> {
  const dbPrices = await new PlanRepository().listPublicPrices().catch(() => []);
  return (
    <>
      <MarketingNav />
      <main>
        <PricingPageContent dbPrices={dbPrices} />
        <MarketingFaq />
      </main>
      <MarketingFooter />
    </>
  );
}
