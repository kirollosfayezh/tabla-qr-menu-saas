import { getTranslations } from 'next-intl/server';
import type { PaymentStatus } from '@prisma/client';
import { AdminPageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/admin/require-admin';
import { AdminPaymentRepository } from '@/repositories/admin/admin-payment.repository';
import { PaymentsTable } from './payments-table';

export const metadata = { title: 'Payments · Admin' };

const PAGE_SIZE = 50;
const VALID: ReadonlyArray<PaymentStatus> = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'];

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.payments');
  const params = await searchParams;
  const status = VALID.includes(params.status as PaymentStatus) ? (params.status as PaymentStatus) : undefined;
  const rows = await new AdminPaymentRepository().list({ status, take: PAGE_SIZE, skip: 0 });
  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />
      <PaymentsTable rows={rows} initialStatus={status ?? ''} />
    </div>
  );
}
