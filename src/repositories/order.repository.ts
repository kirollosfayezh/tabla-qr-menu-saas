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

  public listSince(restaurantId: string, since: Date): Promise<Order[]> {
    return this.db.order.findMany({
      where: { restaurantId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async dailyStats(restaurantId: string, since: Date): Promise<Array<{ day: string; count: number; revenueCents: number }>> {
    const rows = await this.db.$queryRaw<Array<{ day: string; count: bigint; revenue: bigint }>>`
      SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day,
             COUNT(*)::bigint AS count,
             COALESCE(SUM(total_cents), 0)::bigint AS revenue
      FROM orders WHERE restaurant_id = ${restaurantId}::uuid AND created_at >= ${since}
      GROUP BY day ORDER BY day ASC
    `;
    return rows.map((r) => ({ day: r.day, count: Number(r.count), revenueCents: Number(r.revenue) }));
  }

  public async monthlyStats(restaurantId: string, since: Date): Promise<Array<{ month: string; count: number; revenueCents: number }>> {
    const rows = await this.db.$queryRaw<Array<{ month: string; count: bigint; revenue: bigint }>>`
      SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
             COUNT(*)::bigint AS count,
             COALESCE(SUM(total_cents), 0)::bigint AS revenue
      FROM orders WHERE restaurant_id = ${restaurantId}::uuid AND created_at >= ${since}
      GROUP BY month ORDER BY month ASC
    `;
    return rows.map((r) => ({ month: r.month, count: Number(r.count), revenueCents: Number(r.revenue) }));
  }

  public async hourlyDistribution(restaurantId: string, since: Date): Promise<Array<{ hour: number; count: number }>> {
    const rows = await this.db.$queryRaw<Array<{ hour: number; count: bigint }>>`
      SELECT EXTRACT(HOUR FROM created_at)::int AS hour, COUNT(*)::bigint AS count
      FROM orders WHERE restaurant_id = ${restaurantId}::uuid AND created_at >= ${since}
      GROUP BY hour ORDER BY hour ASC
    `;
    const map = new Map(rows.map((r) => [r.hour, Number(r.count)]));
    return Array.from({ length: 24 }, (_, h) => ({ hour: h, count: map.get(h) ?? 0 }));
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
