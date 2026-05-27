export interface CartItemInput {
  id: string;
  name: string;
  nameAr: string | null;
  priceCents: number;
  imageUrl: string | null;
}

export interface CartLine {
  itemId: string;
  name: string;
  nameAr: string | null;
  priceCents: number;
  qty: number;
  notes: string;
  imageUrl: string | null;
}

export interface CartState {
  restaurantId: string;
  lines: CartLine[];
  tableNumber: string;
  add: (item: CartItemInput, qty: number, notes: string) => void;
  setQty: (itemId: string, notes: string, qty: number) => void;
  setNotes: (itemId: string, oldNotes: string, notes: string) => void;
  setTableNumber: (tableNumber: string) => void;
  clear: () => void;
}
