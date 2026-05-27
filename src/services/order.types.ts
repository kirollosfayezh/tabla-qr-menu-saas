export interface PlacedOrderLine {
  itemId: string;
  name: string;
  nameAr: string | null;
  priceCents: number;
  qty: number;
  notes: string | null;
  lineTotalCents: number;
}

export interface PlacedOrder {
  orderId: string;
  tableNumber: string | null;
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
