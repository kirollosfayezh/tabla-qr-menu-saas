import { getTranslations } from 'next-intl/server';
import { AdminPageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/admin/require-admin';
import { AdminUserRepository } from '@/repositories/admin/admin-user.repository';
import { BroadcastForm } from './broadcast-form';
import { InstapayTestCard } from './instapay-test-card';

export const metadata = { title: 'Email · Admin' };

export default async function AdminEmailPage(): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.email');
  const repo = new AdminUserRepository();
  const [all, owners, admins] = await Promise.all([
    repo.count({}),
    repo.count({ role: 'OWNER' }),
    repo.count({ role: 'ADMIN' }),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />
      <InstapayTestCard />
      <BroadcastForm counts={{ all, owners, admins }} />
    </div>
  );
}
