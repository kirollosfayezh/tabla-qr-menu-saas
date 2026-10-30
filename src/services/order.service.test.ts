import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrderService } from './order.service';
import { ForbiddenError, NotFoundError, ValidationError } from '@/lib/errors/errors';
import type { OrderRepository } from '@/repositories/order.repository';
import type { PublicMenuRepository } from '@/repositories/public-menu.repository';
import type { PlaceOrderDTO } from '@/dtos/order.dto';
import type { MenuItemSnapshot, RestaurantSnapshot } from '@/themes/theme.types';
import { menuItem, option, optionGroup, restaurantSnapshot } from '../../tests/fixtures';

const SLUG = 'cafe-nile';

function setup(restaurant: RestaurantSnapshot, items: MenuItemSnapshot[]) {
  const publicMenus = {
    findBySlug: vi.fn(async (slug: string) =>
      slug === SLUG
        ? { restaurant, categories: [{ id: randomUUID(), name: 'Mains', nameAr: null, items }] }
        : null),
  };
  const orders = { create: vi.fn(async () => ({ id: 'order-1' })) };
  const service = new OrderService({
    orders: orders as unknown as OrderRepository,
    publicMenus: publicMenus as unknown as PublicMenuRepository,
  });
  return { service, orders, publicMenus };
}

function order(restaurant: RestaurantSnapshot, lines: PlaceOrderDTO['lines'], extra: Partial<PlaceOrderDTO> = {}): PlaceOrderDTO {
  return { restaurantId: restaurant.id, lines, fulfillmentType: 'DINE_IN', locale: 'en', ...extra };
}

describe('OrderService.placeOrder — totals', () => {
  let restaurant: RestaurantSnapshot;
  beforeEach(() => {
    restaurant = restaurantSnapshot({ taxPercent: 14, serviceChargePercent: 12 });
  });

  it('prices lines from the server-side menu and adds tax and service on the subtotal', async () => {
    const koshari = menuItem({ priceCents: 5000 });
    const tea = menuItem({ name: 'Tea', priceCents: 1250 });
    const { service, orders } = setup(restaurant, [koshari, tea]);

    const placed = await service.placeOrder(SLUG, order(restaurant, [
      { itemId: koshari.id, qty: 2, optionIds: [] },
      { itemId: tea.id, qty: 3, optionIds: [] },
    ]));

    // 2 x 50.00 + 3 x 12.50 = 137.50; 14% tax = 19.25; 12% service = 16.50
    expect(placed.subtotalCents).toBe(13750);
    expect(placed.taxCents).toBe(1925);
    expect(placed.serviceCents).toBe(1650);
    expect(placed.totalCents).toBe(13750 + 1925 + 1650);
    expect(orders.create).toHaveBeenCalledWith(expect.objectContaining({
      restaurantId: restaurant.id,
      totalCents: placed.totalCents,
      currencyCode: 'EGP',
    }));
  });

  it('rounds percentage charges to the nearest minor unit', async () => {
    const r = restaurantSnapshot({ taxPercent: 14, serviceChargePercent: 0 });
    const item = menuItem({ priceCents: 333 });
    const { service } = setup(r, [item]);

    const placed = await service.placeOrder(SLUG, order(r, [{ itemId: item.id, qty: 1, optionIds: [] }]));

    // 3.33 * 14% = 0.4662 -> 47 cents
    expect(placed.taxCents).toBe(47);
    expect(placed.serviceCents).toBe(0);
    expect(placed.totalCents).toBe(380);
  });

  it('adds option price deltas to the unit price before multiplying by quantity', async () => {
    const large = option('Large', 1500);
    const cheese = option('Extra cheese', 500);
    const item = menuItem({
      priceCents: 8000,
      optionGroups: [
        optionGroup({ name: 'Size', options: [option('Regular'), large] }),
        optionGroup({ name: 'Extras', maxSelect: 3, options: [cheese, option('Olives', 300)] }),
      ],
    });
    const r = restaurantSnapshot();
    const { service } = setup(r, [item]);

    const placed = await service.placeOrder(SLUG, order(r, [{ itemId: item.id, qty: 2, optionIds: [large.id, cheese.id] }]));

    expect(placed.lines[0].unitPriceCents).toBe(10000);
    expect(placed.lines[0].lineTotalCents).toBe(20000);
    expect(placed.lines[0].selections.map((s) => s.optionLabel)).toEqual(['Large', 'Extra cheese']);
    expect(placed.totalCents).toBe(20000);
  });

  it('ignores client-sent items that are unknown or unavailable', async () => {
    const available = menuItem({ priceCents: 1000 });
    const soldOut = menuItem({ priceCents: 9999, isAvailable: false });
    const r = restaurantSnapshot();
    const { service } = setup(r, [available, soldOut]);

    const placed = await service.placeOrder(SLUG, order(r, [
      { itemId: available.id, qty: 1, optionIds: [] },
      { itemId: soldOut.id, qty: 1, optionIds: [] },
      { itemId: randomUUID(), qty: 5, optionIds: [] },
    ]));

    expect(placed.lines).toHaveLength(1);
    expect(placed.subtotalCents).toBe(1000);
  });

  it('rejects a cart where nothing is orderable', async () => {
    const soldOut = menuItem({ isAvailable: false });
    const r = restaurantSnapshot();
    const { service, orders } = setup(r, [soldOut]);

    await expect(service.placeOrder(SLUG, order(r, [{ itemId: soldOut.id, qty: 1, optionIds: [] }])))
      .rejects.toThrow(ValidationError);
    expect(orders.create).not.toHaveBeenCalled();
  });
});

describe('OrderService.placeOrder — option validation', () => {
  const r = restaurantSnapshot();

  it('requires at least one choice from a required group even when minSelect is 0', async () => {
    const item = menuItem({ optionGroups: [optionGroup({ name: 'Size', required: true, minSelect: 0, options: [option('S'), option('L')] })] });
    const { service } = setup(r, [item]);

    await expect(service.placeOrder(SLUG, order(r, [{ itemId: item.id, qty: 1, optionIds: [] }])))
      .rejects.toThrow('Choose Size');
  });

  it('enforces minSelect on optional groups', async () => {
    const sauces = [option('Tahini'), option('Garlic'), option('Chili')];
    const item = menuItem({ optionGroups: [optionGroup({ name: 'Sauces', minSelect: 2, maxSelect: 3, options: sauces })] });
    const { service } = setup(r, [item]);

    await expect(service.placeOrder(SLUG, order(r, [{ itemId: item.id, qty: 1, optionIds: [sauces[0].id] }])))
      .rejects.toThrow('Choose Sauces');
    await expect(service.placeOrder(SLUG, order(r, [{ itemId: item.id, qty: 1, optionIds: [sauces[0].id, sauces[1].id] }])))
      .resolves.toMatchObject({ lines: [expect.objectContaining({ itemId: item.id })] });
  });

  it('enforces maxSelect', async () => {
    const extras = [option('A'), option('B'), option('C')];
    const item = menuItem({ optionGroups: [optionGroup({ name: 'Extras', maxSelect: 2, options: extras })] });
    const { service } = setup(r, [item]);

    await expect(service.placeOrder(SLUG, order(r, [{ itemId: item.id, qty: 1, optionIds: extras.map((e) => e.id) }])))
      .rejects.toThrow('Choose at most 2 from Extras');
  });

  it('rejects option ids that do not belong to the item', async () => {
    const item = menuItem({ optionGroups: [optionGroup({ options: [option('S')] })] });
    const other = menuItem({ optionGroups: [optionGroup({ options: [option('Foreign', 10_000)] })] });
    const { service } = setup(r, [item, other]);

    await expect(service.placeOrder(SLUG, order(r, [
      { itemId: item.id, qty: 1, optionIds: [other.optionGroups[0].options[0].id] },
    ]))).rejects.toThrow('Invalid item option');
  });
});

describe('OrderService.placeOrder — tenancy and fulfillment', () => {
  it('throws NotFound for an unknown slug', async () => {
    const r = restaurantSnapshot();
    const { service } = setup(r, []);
    await expect(service.placeOrder('nope', order(r, []))).rejects.toThrow(NotFoundError);
  });

  it('refuses an order whose restaurantId does not match the slug', async () => {
    const r = restaurantSnapshot();
    const item = menuItem();
    const { service } = setup(r, [item]);
    const forged = { ...order(r, [{ itemId: item.id, qty: 1, optionIds: [] }]), restaurantId: randomUUID() };
    await expect(service.placeOrder(SLUG, forged)).rejects.toThrow(ForbiddenError);
  });

  it('refuses orders for a restaurant that is not ACTIVE', async () => {
    const r = restaurantSnapshot({ status: 'SUSPENDED' });
    const item = menuItem();
    const { service } = setup(r, [item]);
    await expect(service.placeOrder(SLUG, order(r, [{ itemId: item.id, qty: 1, optionIds: [] }])))
      .rejects.toThrow('Menu is unavailable');
  });

  it('keeps only delivery fields for delivery and only the table for dine-in', async () => {
    const r = restaurantSnapshot();
    const item = menuItem();
    const { service } = setup(r, [item]);
    const lines = [{ itemId: item.id, qty: 1, optionIds: [] }];
    const all = {
      tableNumber: '7',
      customerPhone: '+201234',
      deliveryAddress: '1 Nile St',
      deliveryLat: 30.04,
      deliveryLng: 31.23,
    };

    const dineIn = await service.placeOrder(SLUG, order(r, lines, { ...all, fulfillmentType: 'DINE_IN' }));
    expect(dineIn).toMatchObject({ tableNumber: '7', customerPhone: null, deliveryAddress: null, deliveryLat: null });

    const delivery = await service.placeOrder(SLUG, order(r, lines, { ...all, fulfillmentType: 'DELIVERY' }));
    expect(delivery).toMatchObject({ tableNumber: null, customerPhone: '+201234', deliveryAddress: '1 Nile St', deliveryLat: 30.04, deliveryLng: 31.23 });
  });
});
