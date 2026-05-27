import type { MenuItem, Prisma, Restaurant } from '@prisma/client';
import { OrderRepository } from '@/repositories/order.repository';
import { PublicMenuRepository } from '@/repositories/public-menu.repository';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors/errors';
import type { PlaceOrderDTO } from '@/dtos/order.dto';
import type { PlacedOrder, PlacedOrderLine } from './order.types';

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
    const restaurant = await this.publicMenus.findRestaurantBySlug(slug);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.status !== 'ACTIVE') throw new ForbiddenError('Menu is unavailable');

    const items = await this.publicMenus.listItemsByIds(
      restaurant.id,
      input.lines.map((line) => line.itemId),
    );
    const lines = buildLines(input.lines, items.filter((item) => item.isAvailable));
    if (lines.length === 0) throw new ValidationError('No available items in cart');

    const subtotalCents = sum(lines.map((line) => line.lineTotalCents));
    const taxCents = percent(subtotalCents, Number(restaurant.taxPercent));
    const serviceCents = percent(subtotalCents, Number(restaurant.serviceChargePercent));
    const totalCents = subtotalCents + taxCents + serviceCents;
    const order = await this.orders.create({
      restaurantId: restaurant.id,
      tableNumber: input.tableNumber || null,
      items: toJsonSnapshot(lines, { subtotalCents, taxCents, serviceCents }),
      totalCents,
      currencyCode: restaurant.currencyCode,
      customerLocale: input.locale,
      deviceInfo: input.deviceInfo || null,
      whatsappRedirectedAt: new Date(),
    });
    return toPlacedOrder(order.id, restaurant, input.tableNumber || null, lines, {
      subtotalCents,
      taxCents,
      serviceCents,
      totalCents,
    });
  }
}

function buildLines(input: PlaceOrderDTO['lines'], items: MenuItem[]): PlacedOrderLine[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return input.flatMap((line) => {
    const item = byId.get(line.itemId);
    if (!item) return [];
    return [{
      itemId: item.id,
      name: item.name,
      nameAr: item.nameAr,
      priceCents: item.priceCents,
      qty: line.qty,
      notes: line.notes || null,
      lineTotalCents: item.priceCents * line.qty,
    }];
  });
}

function toPlacedOrder(
  orderId: string,
  restaurant: Restaurant,
  tableNumber: string | null,
  lines: PlacedOrderLine[],
  totals: Pick<PlacedOrder, 'subtotalCents' | 'taxCents' | 'serviceCents' | 'totalCents'>,
): PlacedOrder {
  return {
    orderId,
    tableNumber,
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
      qty: line.qty,
      notes: line.notes,
      lineTotalCents: line.lineTotalCents,
    })),
  };
}
