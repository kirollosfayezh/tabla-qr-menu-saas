import { getTranslations } from 'next-intl/server';
import { AdminPageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { requireAdmin } from '@/lib/admin/require-admin';
import { AdminRestaurantRepository } from '@/repositories/admin/admin-restaurant.repository';
import { AdminUserRepository } from '@/repositories/admin/admin-user.repository';
import { AdminPaymentRepository } from '@/repositories/admin/admin-payment.repository';
import { prisma } from '@/repositories/prisma.client';

export const metadata = { title: 'Admin · Tabla' };

export default async function AdminHomePage(): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.home');
  const restaurants = new AdminRestaurantRepository();
  const users = new AdminUserRepository();
  const payments = new AdminPaymentRepository();

  const [byStatus, totalUsers, ordersToday, revenue] = await Promise.all([
    restaurants.countByStatus(),
    users.count({}),
    countOrdersToday(),
    payments.sumSuccessfulCents(),
  ]);

  const counts: Record<string, number> = {};
  for (const row of byStatus) counts[row.status] = row.count;
  const active = counts.ACTIVE ?? 0;
  const pending = counts.PENDING_PAYMENT ?? 0;
  const suspended = counts.SUSPENDED ?? 0;
  const total = active + pending + suspended;
  const revenueCents = revenue._sum.amountCents ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description')} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t('restaurants')} value={String(total)} hint={t('activeHint', { active, suspended })} />
        <StatCard label={t('pendingPayment')} value={String(pending)} />
        <StatCard label={t('users')} value={String(totalUsers)} />
        <StatCard label={t('ordersToday')} value={String(ordersToday)} />
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard label={t('revenueAllTime')} value={formatCents(revenueCents)} hint={t('successOnly')} />
        <StatCard label={t('signedInAs')} value={(await requireAdmin()).email} />
      </section>
    </div>
  );
}

async function countOrdersToday(): Promise<number> {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return prisma.order.count({ where: { createdAt: { gte: start } } });
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EGP' }).format(cents / 100);
}
