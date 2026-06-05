import type { Prisma } from '@prisma/client';
import { OrderRepository } from '@/repositories/order.repository';
import { PublicMenuRepository } from '@/repositories/public-menu.repository';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors/errors';
import type { PlaceOrderDTO } from '@/dtos/order.dto';
import type { PlacedOrder, PlacedOrderLine, PlacedOrderSelection } from './order.types';
import type { MenuItemSnapshot, RestaurantSnapshot } from '@/themes/theme.types';

interface Deps {
  orders?: OrderRepository;
  publicMenus?: PublicMenuRepository;
}

export class OrderService {
  private readonly orders: OrderRepository;
  private readonly publicMenus: PublicMenuRepository;

  constructor(deps: Deps = {}) {
    this.orders = deps.orders ?? new OrderRepository();
    this.publicMenus = deps.publicMenus ?? new PublicMenuRepository();
  }

  public async placeOrder(slug: string, input: PlaceOrderDTO): Promise<PlacedOrder> {
    const menu = await this.publicMenus.findBySlug(slug);
    if (!menu) throw new NotFoundError('Restaurant');
    const restaurant = menu.restaurant;
    if (restaurant.id !== input.restaurantId) throw new ForbiddenError('Restaurant mismatch');
    if (restaurant.status !== 'ACTIVE') throw new ForbiddenError('Menu is unavailable');

    const items = menu.categories.flatMap((category) => category.items);
    const lines = buildLines(input.lines, items.filter((item) => item.isAvailable));
    if (lines.length === 0) throw new ValidationError('No available items in cart');

    const subtotalCents = sum(lines.map((line) => line.lineTotalCents));
    const taxCents = percent(subtotalCents, Number(restaurant.taxPercent));
    const serviceCents = percent(subtotalCents, Number(restaurant.serviceChargePercent));
    const totalCents = subtotalCents + taxCents + serviceCents;
    const order = await this.orders.create({
      restaurantId: restaurant.id,
      ...fulfillmentColumns(input),
      items: toJsonSnapshot(lines, { subtotalCents, taxCents, serviceCents }),
      totalCents,
      currencyCode: restaurant.currencyCode,
      customerLocale: input.locale,
      deviceInfo: input.deviceInfo || null,
      whatsappRedirectedAt: new Date(),
    });
    return toPlacedOrder(order.id, restaurant, input, lines, {
      subtotalCents,
      taxCents,
      serviceCents,
      totalCents,
    });
  }
}

function buildLines(input: PlaceOrderDTO['lines'], items: ReadonlyArray<MenuItemSnapshot>): PlacedOrderLine[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return input.flatMap((line) => {
    const item = byId.get(line.itemId);
    if (!item) return [];
    const selections = resolveAndValidateSelections(item, line.optionIds);
    const unitPriceCents = item.priceCents + sum(selections.map((s) => s.priceDeltaCents));
    return [{
      itemId: item.id,
      name: item.name,
      nameAr: item.nameAr,
      priceCents: item.priceCents,
      unitPriceCents,
      qty: line.qty,
      notes: line.notes || null,
      selections,
      lineTotalCents: unitPriceCents * line.qty,
    }];
  });
}

function resolveAndValidateSelections(item: MenuItemSnapshot, optionIds: ReadonlyArray<string>): PlacedOrderSelection[] {
  const requested = new Set(optionIds);
  const selections: PlacedOrderSelection[] = [];
  for (const group of item.optionGroups) {
    const selected = group.options.filter((option) => requested.has(option.id));
    const minRequired = group.required ? Math.max(1, group.minSelect) : group.minSelect;
    if (selected.length < minRequired) {
      throw new ValidationError(`Choose ${group.name}`);
    }
    if (selected.length > group.maxSelect) {
      throw new ValidationError(`Choose at most ${group.maxSelect} from ${group.name}`);
    }
    for (const option of selected) {
      selections.push({
        groupId: group.id,
        groupName: group.name,
        groupNameAr: group.nameAr,
        optionId: option.id,
        optionLabel: option.label,
        optionLabelAr: option.labelAr,
        priceDeltaCents: option.priceDeltaCents,
      });
    }
    for (const option of selected) requested.delete(option.id);
  }
  if (requested.size > 0) throw new ValidationError('Invalid item option');
  return selections;
}

/** Fulfillment-specific columns, normalized so dine-in/delivery only keep their own fields. */
type FulfillmentInput = Pick<PlaceOrderDTO, 'fulfillmentType' | 'tableNumber' | 'customerName' | 'customerPhone' | 'deliveryAddress' | 'deliveryLat' | 'deliveryLng'>;
function fulfillmentColumns(input: FulfillmentInput): Pick<PlacedOrder, 'fulfillmentType' | 'tableNumber' | 'customerName' | 'customerPhone' | 'deliveryAddress' | 'deliveryLat' | 'deliveryLng'> {
  const isDelivery = input.fulfillmentType === 'DELIVERY';
  return {
    fulfillmentType: input.fulfillmentType,
    tableNumber: isDelivery ? null : input.tableNumber || null,
    customerName: input.customerName || null,
    customerPhone: isDelivery ? input.customerPhone || null : null,
    deliveryAddress: isDelivery ? input.deliveryAddress || null : null,
    deliveryLat: isDelivery && input.deliveryLat != null ? input.deliveryLat : null,
    deliveryLng: isDelivery && input.deliveryLng != null ? input.deliveryLng : null,
  };
}

function toPlacedOrder(
  orderId: string,
  restaurant: RestaurantSnapshot,
  input: FulfillmentInput,
  lines: PlacedOrderLine[],
  totals: Pick<PlacedOrder, 'subtotalCents' | 'taxCents' | 'serviceCents' | 'totalCents'>,
): PlacedOrder {
  return {
    orderId,
    ...fulfillmentColumns(input),
    ...totals,
    currencyCode: restaurant.currencyCode,
    lines,
    restaurant: {
      name: restaurant.name,
      nameAr: restaurant.nameAr,
      whatsappNumber: restaurant.whatsappNumber,
    },
  };
}

function percent(cents: number, value: number): number {
  return Math.round((cents * value) / 100);
}

function sum(values: ReadonlyArray<number>): number {
  return values.reduce((total, value) => total + value, 0);
}

function toJsonSnapshot(
  lines: ReadonlyArray<PlacedOrderLine>,
  totals: Pick<PlacedOrder, 'subtotalCents' | 'taxCents' | 'serviceCents'>,
): Prisma.InputJsonObject {
  return {
    ...totals,
    lines: lines.map((line) => ({
      itemId: line.itemId,
      name: line.name,
      nameAr: line.nameAr,
      priceCents: line.priceCents,
      unitPriceCents: line.unitPriceCents,
      qty: line.qty,
      notes: line.notes,
      selections: line.selections.map((selection) => ({
        groupId: selection.groupId,
        groupName: selection.groupName,
        groupNameAr: selection.groupNameAr,
        optionId: selection.optionId,
        optionLabel: selection.optionLabel,
        optionLabelAr: selection.optionLabelAr,
        priceDeltaCents: selection.priceDeltaCents,
      })),
      lineTotalCents: line.lineTotalCents,
    })),
  };
}
