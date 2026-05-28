import { getTranslations } from 'next-intl/server';
import type { UserRole } from '@prisma/client';
import { AdminPageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/admin/require-admin';
import { AdminUserRepository } from '@/repositories/admin/admin-user.repository';
import { UsersTable } from './users-table';

export const metadata = { title: 'Users · Admin' };

const PAGE_SIZE = 50;
const VALID: ReadonlyArray<UserRole> = ['OWNER', 'ADMIN'];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}): Promise<React.JSX.Element> {
  const actor = await requireAdmin();
  const t = await getTranslations('admin.users');
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const role = VALID.includes(params.role as UserRole) ? (params.role as UserRole) : undefined;

  const rows = await new AdminUserRepository().list({ search, role, take: PAGE_SIZE, skip: 0 });
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />
      <UsersTable rows={rows} initialSearch={search ?? ''} initialRole={role ?? ''} currentUserId={actor.userId} />
    </div>
  );
}
