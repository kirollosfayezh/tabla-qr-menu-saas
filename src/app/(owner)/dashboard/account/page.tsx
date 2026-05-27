import { useTranslations } from 'next-intl';
import { ComingSoon } from '@/components/owner/coming-soon';

export const metadata = { title: 'Account · Tabla' };

export default function AccountPage(): React.JSX.Element {
  const t = useTranslations('owner');
  return <ComingSoon title={t('account.title')} stageLabel="later" />;
}
