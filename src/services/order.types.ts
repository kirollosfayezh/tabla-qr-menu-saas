export interface PlacedOrderLine {
  itemId: string;
  name: string;
  nameAr: string | null;
  priceCents: number;
  unitPriceCents: number;
  qty: number;
  notes: string | null;
  selections: ReadonlyArray<PlacedOrderSelection>;
  lineTotalCents: number;
}

export interface PlacedOrderSelection {
  groupId: string;
  groupName: string;
  groupNameAr: string | null;
  optionId: string;
  optionLabel: string;
  optionLabelAr: string | null;
  priceDeltaCents: number;
}

export interface PlacedOrder {
  orderId: string;
  fulfillmentType: 'DINE_IN' | 'DELIVERY';
  tableNumber: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: string | null;
  subtotalCents: number;
  taxCents: number;
  serviceCents: number;
  totalCents: number;
  currencyCode: string;
  lines: ReadonlyArray<PlacedOrderLine>;
  restaurant: {
    name: string;
    nameAr: string | null;
    whatsappNumber: string;
  };
}
