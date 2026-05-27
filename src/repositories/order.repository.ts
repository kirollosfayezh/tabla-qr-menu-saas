import type { Order, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface OrderCreateInput {
  restaurantId: string;
  tableNumber: string | null;
  items: Prisma.InputJsonValue;
  totalCents: number;
  currencyCode: string;
  customerLocale: 'en' | 'ar';
  deviceInfo: string | null;
  whatsappRedirectedAt: Date;
}

export type PublicOrder = Order & {
  restaurant: {
    name: string;
    nameAr: string | null;
    whatsappNumber: string;
  };
};

export class OrderRepository extends BaseRepository {
  public create(input: OrderCreateInput): Promise<Order> {
    return this.db.order.create({ data: input });
  }

  public listByRestaurant(restaurantId: string, limit: number): Promise<Order[]> {
    return this.db.order.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  public findByIdPublic(id: string): Promise<PublicOrder | null> {
    return this.db.order.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: { name: true, nameAr: true, whatsappNumber: true },
        },
      },
    });
  }
}
