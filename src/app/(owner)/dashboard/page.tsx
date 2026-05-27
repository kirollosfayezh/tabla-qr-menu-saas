import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/owner/page-header';
import { StatCard } from '@/components/owner/stat-card';

export const metadata = { title: 'Dashboard · Tabla' };

/** Owner dashboard home — KPI strip + placeholders for upcoming widgets. */
export default function DashboardHomePage(): React.JSX.Element {
  const t = useTranslations('owner');
  return (
    <div className="space-y-6">
      <PageHeader title={t('dashboard.title')} description={t('dashboard.subtitle')} />
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('dashboard.viewsToday')} value="—" hint={t('comingSoon')} />
        <StatCard label={t('dashboard.ordersToday')} value="—" hint={t('comingSoon')} />
        <StatCard label={t('dashboard.topItems')} value="—" hint={t('comingSoon')} />
        <StatCard label={t('dashboard.revenue')} value="—" hint={t('comingSoon')} />
      </section>
    </div>
  );
}
