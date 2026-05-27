import { getTranslations } from 'next-intl/server';
import { env } from '@/config/env';
import { PageHeader } from '@/components/owner/page-header';
import { requireOwnerRestaurant } from '@/lib/tenant/require-restaurant';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import { QrClient } from './qr-client';

export const metadata = { title: 'QR Code · Tabla' };

export default async function QrPage(): Promise<React.JSX.Element> {
  const t = await getTranslations('owner');
  const ctx = await requireOwnerRestaurant();
  const restaurant = await new RestaurantRepository().findByOwnerId(ctx.userId);
  if (!restaurant) throw new Error('Restaurant missing');
  const menuUrl = `${env.APP_PUBLIC_URL.replace(/\/$/, '')}/${restaurant.slug}`;
  return (
    <div className="space-y-6">
      <PageHeader title={t('qr.title')} description={t('qr.subtitle')} />
      <QrClient
        restaurantName={restaurant.name}
        menuUrl={menuUrl}
        primaryColor={restaurant.primaryColor}
      />
    </div>
  );
}
