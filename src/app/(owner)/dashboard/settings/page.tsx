import { useTranslations } from 'next-intl';
import { ComingSoon } from '@/components/owner/coming-soon';

export const metadata = { title: 'Settings · Tabla' };

export default function SettingsPage(): React.JSX.Element {
  const t = useTranslations('owner');
  return <ComingSoon title={t('settings.title')} stageLabel="Stage 1C" />;
}
