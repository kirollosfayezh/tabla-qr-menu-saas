import { getTranslations } from 'next-intl/server';
import type { RestaurantStatus } from '@prisma/client';
import { AdminPageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/admin/require-admin';
import { AdminRestaurantRepository } from '@/repositories/admin/admin-restaurant.repository';
import { RestaurantsTable, type RestaurantsTableRow } from './restaurants-table';

export const metadata = { title: 'Restaurants · Admin' };

const PAGE_SIZE = 50;
const VALID_STATUSES: ReadonlyArray<RestaurantStatus> = ['PENDING_PAYMENT', 'ACTIVE', 'SUSPENDED'];

interface SearchParamsShape {
  q?: string;
  status?: string;
}

export default async function AdminRestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsShape>;
}): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.restaurants');
  const params = await searchParams;
  const search = params.q?.trim() || undefined;
  const status = VALID_STATUSES.includes(params.status as RestaurantStatus)
    ? (params.status as RestaurantStatus)
    : undefined;

  const repo = new AdminRestaurantRepository();
  const [rawRows, total] = await Promise.all([
    repo.list({ search, status, take: PAGE_SIZE, skip: 0 }),
    repo.count({ search, status }),
  ]);
  const rows: RestaurantsTableRow[] = rawRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    createdAt: row.createdAt,
    ordersCount: row._count.orders,
    owner: { email: row.owner.email, name: row.owner.name },
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t('title')} description={t('description', { total })} />
      <RestaurantsTable rows={rows} initialSearch={search ?? ''} initialStatus={status ?? ''} />
    </div>
  );
}
