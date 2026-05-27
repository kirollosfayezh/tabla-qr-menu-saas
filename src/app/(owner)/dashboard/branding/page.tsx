import { useTranslations } from 'next-intl';
import { ComingSoon } from '@/components/owner/coming-soon';

export const metadata = { title: 'Branding · Tabla' };

export default function BrandingPage(): React.JSX.Element {
  const t = useTranslations('owner');
  return <ComingSoon title={t('branding.title')} stageLabel="Stage 1C" />;
}
