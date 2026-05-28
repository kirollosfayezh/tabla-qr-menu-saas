import { getTranslations } from 'next-intl/server';
import { AdminPageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/admin/require-admin';
import { AdminPlanRepository } from '@/repositories/admin/admin-plan.repository';
import { AdminThemeRepository } from '@/repositories/admin/admin-theme.repository';
import { PlanEditor } from './plan-editor';

export const metadata = { title: 'Plans · Admin' };

/**
 * Admin plan control panel.
 * Admin sets max items, max categories, and accessible themes per plan.
 * Changes take effect immediately for all restaurants on that plan.
 */
export default async function AdminPackagesPage(): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.plans');
  const [plans, themes] = await Promise.all([
    new AdminPlanRepository().listAll(),
    new AdminThemeRepository().listAll(),
  ]);
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />
      <PlanEditor plans={plans} themes={themes} />
    </div>
  );
}
