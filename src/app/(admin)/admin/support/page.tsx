import { getTranslations } from 'next-intl/server';
import { AdminPageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/admin/require-admin';
import { SupportRepository } from '@/repositories/support.repository';
import { SupportInbox } from './support-inbox';

export const metadata = { title: 'Support · Admin' };

export default async function AdminSupportPage(): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.support');
  const conversations = await new SupportRepository().listConversations();
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />
      <SupportInbox conversations={conversations} />
    </div>
  );
}
