import type { Prisma, Restaurant } from '@prisma/client';
import { BaseRepository } from './base.repository';

/** Data access for the Restaurant entity. */
export class RestaurantRepository extends BaseRepository {
  /** Find the first restaurant owned by a user (MVP: one restaurant per owner). */
  public findByOwnerId(ownerId: string): Promise<Restaurant | null> {
    return this.db.restaurant.findFirst({ where: { ownerId } });
  }

  /** Find a restaurant by its public slug. */
  public findBySlug(slug: string): Promise<Restaurant | null> {
    return this.db.restaurant.findUnique({ where: { slug } });
  }

  /** Find a restaurant by subdomain (usually equal to slug). */
  public findBySubdomain(subdomain: string): Promise<Restaurant | null> {
    return this.db.restaurant.findUnique({ where: { subdomain } });
  }

  /** True if either the slug or subdomain is already taken. */
  public async slugExists(slug: string): Promise<boolean> {
    const hit = await this.db.restaurant.findFirst({
      where: { OR: [{ slug }, { subdomain: slug }] },
      select: { id: true },
    });
    return hit !== null;
  }

  /** Insert a new restaurant row. */
  public create(data: Prisma.RestaurantCreateInput): Promise<Restaurant> {
    return this.db.restaurant.create({ data });
  }

  public updateTheme(
    restaurantId: string,
    themeId: string,
    status: Restaurant['status'] = 'ACTIVE',
  ): Promise<Restaurant> {
    return this.db.restaurant.update({
      where: { id: restaurantId },
      data: {
        themeId,
        status,
        publishedAt: status === 'ACTIVE' ? new Date() : undefined,
      },
    });
  }
}
