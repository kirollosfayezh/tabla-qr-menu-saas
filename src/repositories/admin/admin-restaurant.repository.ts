import type { Prisma, Restaurant, RestaurantStatus } from '@prisma/client';
import { BaseRepository } from '../base.repository';

export interface AdminRestaurantFilters {
  search?: string;
  status?: RestaurantStatus;
  take: number;
  skip: number;
}

export type AdminRestaurantRow = Restaurant & {
  owner: { id: string; email: string; name: string | null };
  _count: { orders: number };
};

/**
 * Admin-side data access for restaurants.
 * Bypasses tenant scoping by design — only callable from code paths that have already
 * verified the caller is an ADMIN via `requireAdmin()`.
 */
export class AdminRestaurantRepository extends BaseRepository {
  public list(filters: AdminRestaurantFilters): Promise<AdminRestaurantRow[]> {
    return this.db.restaurant.findMany({
      where: buildWhere(filters),
      include: {
        owner: { select: { id: true, email: true, name: true } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.take,
      skip: filters.skip,
    });
  }

  public count(filters: Omit<AdminRestaurantFilters, 'take' | 'skip'>): Promise<number> {
    return this.db.restaurant.count({ where: buildWhere(filters) });
  }

  public setStatus(restaurantId: string, status: RestaurantStatus): Promise<Restaurant> {
    return this.db.restaurant.update({ where: { id: restaurantId }, data: { status } });
  }

  public async countByStatus(): Promise<Array<{ status: RestaurantStatus; count: number }>> {
    const rows = await this.db.restaurant.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return rows.map((row) => ({ status: row.status, count: row._count._all }));
  }
}

function buildWhere(filters: Pick<AdminRestaurantFilters, 'search' | 'status'>): Prisma.RestaurantWhereInput {
  const where: Prisma.RestaurantWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.search) {
    const term = filters.search.trim();
    where.OR = [
      { name: { contains: term, mode: 'insensitive' } },
      { slug: { contains: term, mode: 'insensitive' } },
      { owner: { email: { contains: term, mode: 'insensitive' } } },
    ];
  }
  return where;
}
