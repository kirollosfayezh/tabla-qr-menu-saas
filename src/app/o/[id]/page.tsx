import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { buildDeepLink, buildOrderMessage } from '@/lib/whatsapp/message-builder';
import { OrderRepository } from '@/repositories/order.repository';
import type { SupportedLocale } from '@/i18n/config';

interface PageProps {
  params: Promise<{ id: string }>;
}

const OrderLineSchema = z.object({
  itemId: z.string(),
  name: z.string(),
  nameAr: z.string().nullable(),
  priceCents: z.number().int(),
  unitPriceCents: z.number().int().optional(),
  qty: z.number().int(),
  notes: z.string().nullable(),
  selections: z.array(z.object({
    groupId: z.string(),
    groupName: z.string(),
    groupNameAr: z.string().nullable(),
    optionId: z.string(),
    optionLabel: z.string(),
    optionLabelAr: z.string().nullable(),
    priceDeltaCents: z.number().int(),
  })).default([]),
  lineTotalCents: z.number().int(),
});

const OrderSnapshotSchema = z.union([
  z.array(OrderLineSchema).transform((lines) => ({
    lines,
    subtotalCents: lines.reduce((total, line) => total + line.lineTotalCents, 0),
    taxCents: 0,
    serviceCents: 0,
  })),
  z.object({
    lines: z.array(OrderLineSchema),
    subtotalCents: z.number().int(),
    taxCents: z.number().int(),
    serviceCents: z.number().int(),
  }),
]);

export default async function OrderSummaryPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const order = await new OrderRepository().findByIdPublic(id);
  if (!order) notFound();

  const locale = ((await getLocale()) as SupportedLocale) === 'ar' ? 'ar' : 'en';
  const snapshot = OrderSnapshotSchema.parse(order.items);
  const message = buildOrderMessage({
    restaurant: order.restaurant,
    locale,
    order: {
      id: order.id,
      fulfillmentType: 'DINE_IN',
      tableNumber: order.tableNumber,
      customerName: null,
      customerPhone: null,
      deliveryAddress: null,
      subtotalCents: snapshot.subtotalCents,
      taxCents: snapshot.taxCents,
      serviceCents: snapshot.serviceCents,
      totalCents: order.totalCents,
      currencyCode: order.currencyCode,
      lines: snapshot.lines,
    },
  });
  const t = await getTranslations('tenant.orderSummary');
  const short = t('shortMessage', { id: order.id.slice(0, 8) });
  const link = buildDeepLink(order.restaurant.whatsappNumber, short);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-5 px-4 py-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-orange-600">{t('eyebrow')}</p>
        <h1 className="font-display text-3xl font-semibold">{t('title')}</h1>
        <p className="text-sm opacity-70">{t('description')}</p>
      </header>
      <pre className="whitespace-pre-wrap rounded-lg bg-neutral-100 p-4 text-sm leading-6">
        {message}
      </pre>
      <Link
        href={link.url}
        target="_blank"
        className="rounded-full bg-orange-600 px-5 py-3 text-center text-sm font-semibold text-white"
      >
        {t('openWhatsApp')}
      </Link>
    </main>
  );
}
