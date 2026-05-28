import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AdminPageHeader } from '@/components/admin/page-header';
import { requireAdmin } from '@/lib/admin/require-admin';
import { SupportRepository } from '@/repositories/support.repository';
import { prisma } from '@/repositories/prisma.client';
import { AdminReplyChat } from '../admin-reply-chat';

export default async function AdminThreadPage({ params }: { params: Promise<{ restaurantId: string }> }): Promise<React.JSX.Element> {
  await requireAdmin();
  const t = await getTranslations('admin.support');
  const { restaurantId } = await params;

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, name: true },
  });
  if (!restaurant) notFound();

  const repo = new SupportRepository();
  const [messages] = await Promise.all([
    repo.listByRestaurant(restaurantId),
    repo.markReadByAdmin(restaurantId),
  ]);

  return (
    <div className="space-y-4">
      <AdminPageHeader title={restaurant.name} description={t('threadDesc')} />
      <AdminReplyChat restaurantId={restaurantId} messages={messages} />
    </div>
  );
}
