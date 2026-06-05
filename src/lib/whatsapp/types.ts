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
  unitPriceCents?: number;
  selections?: ReadonlyArray<OrderMessageSelection>;
  lineTotalCents: number;
  notes: string | null;
}

export interface OrderMessageSelection {
  groupName: string;
  groupNameAr: string | null;
  optionLabel: string;
  optionLabelAr: string | null;
  priceDeltaCents: number;
}

export interface OrderMessageSnapshot {
  id: string;
  fulfillmentType: 'DINE_IN' | 'DELIVERY';
  tableNumber: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
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
