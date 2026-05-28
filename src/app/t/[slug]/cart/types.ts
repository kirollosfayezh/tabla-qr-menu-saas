export interface CartSelection {
  groupId: string;
  groupName: string;
  groupNameAr: string | null;
  optionId: string;
  optionLabel: string;
  optionLabelAr: string | null;
  priceDeltaCents: number;
}

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
  /** Selected option choices, frozen at add time. Empty array when the item has no options. */
  selections: ReadonlyArray<CartSelection>;
}

export interface CartState {
  restaurantId: string;
  lines: CartLine[];
  tableNumber: string;
  add: (item: CartItemInput, qty: number, notes: string, selections: ReadonlyArray<CartSelection>) => void;
  /** key = same hash used by `lineKey()` — distinguishes same item with different options. */
  setQty: (key: string, qty: number) => void;
  setNotes: (key: string, notes: string) => void;
  setTableNumber: (tableNumber: string) => void;
  clear: () => void;
}

/** Stable string identity for a cart line: itemId + sorted-option-ids + notes. */
export function lineKey(line: Pick<CartLine, 'itemId' | 'selections' | 'notes'>): string {
  const sel = (line.selections ?? [])
    .map((s) => s.optionId)
    .slice()
    .sort()
    .join('|');
  return `${line.itemId}::${sel}::${line.notes.trim()}`;
}
