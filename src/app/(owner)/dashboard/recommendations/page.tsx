import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { SupportRepository } from '@/repositories/support.repository';
import { SupportChat } from './support-chat';

export const metadata = { title: 'Recommendations · Tabla' };

/**
 * Owner-side support chat.
 * Owner writes questions / requests → admin replies from /admin/support.
 */
export default async function RecommendationsPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner.recommendations');
  const ctx = await requireOwnerRestaurant();

  const repo = new SupportRepository();
  const [messages] = await Promise.all([
    repo.listByRestaurant(ctx.restaurantId),
    repo.markReadByOwner(ctx.restaurantId),
  ]);

  return (
    <div className="flex h-full flex-col space-y-4">
      <PageHeader title={t('title')} description={t('description')} />
      <SupportChat messages={messages} />
    </div>
  );
}
