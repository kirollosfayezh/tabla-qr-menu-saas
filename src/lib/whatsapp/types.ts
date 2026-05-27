import type { SupportedLocale } from '@/i18n/config';

export interface OrderMessageRestaurant {
  name: string;
  nameAr: string | null;
  whatsappNumber: string;
}

export interface OrderMessageLine {
  qty: number;
  name: string;
  nameAr: string | null;
  priceCents: number;
  lineTotalCents: number;
  notes: string | null;
}

export interface OrderMessageSnapshot {
  id: string;
  tableNumber: string | null;
  subtotalCents: number;
  taxCents: number;
  serviceCents: number;
  totalCents: number;
  currencyCode: string;
  lines: ReadonlyArray<OrderMessageLine>;
}

export interface MessageBuildInput {
  restaurant: OrderMessageRestaurant;
  order: OrderMessageSnapshot;
  locale: SupportedLocale;
}
