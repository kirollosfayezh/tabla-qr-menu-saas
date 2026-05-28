import { getTranslations } from 'next-intl/server';
import { AdminPageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/admin/require-admin';
import { AdminThemeRepository } from '@/repositories/admin/admin-theme.repository';
import { ThemesGrid } from './themes-grid';

export const metadata = { title: 'Themes · Admin' };

export default async function AdminThemesPage(): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.themes');
  const themes = await new AdminThemeRepository().listAll();
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />
      <ThemesGrid themes={themes} />
    </div>
  );
}
