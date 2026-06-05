import type { Prisma, Restaurant } from '@prisma/client';
import { BaseRepository } from './base.repository';

/** Data access for the Restaurant entity. */
export class RestaurantRepository extends BaseRepository {
  /** Find the first restaurant owned by a user (MVP: one restaurant per owner). */
  public findByOwnerId(ownerId: string): Promise<Restaurant | null> {
    return this.db.restaurant.findFirst({ where: { ownerId } });
  }

  public findById(id: string): Promise<Restaurant | null> {
    return this.db.restaurant.findUnique({ where: { id } });
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

  public update(restaurantId: string, data: Prisma.RestaurantUpdateInput): Promise<Restaurant> {
    return this.db.restaurant.update({ where: { id: restaurantId }, data });
  }

  /**
   * Move a restaurant onto a paid plan after a successful plan payment.
   * Clears the free-trial deadline and activates the tenant so the diner menu
   * (and the dashboard) come back online immediately.
   */
  public activatePlan(restaurantId: string, planKey: string): Promise<Restaurant> {
    return this.db.restaurant.update({
      where: { id: restaurantId },
      data: { planKey, trialEndsAt: null, status: 'ACTIVE' },
    });
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

  /**
   * Activate an (entitled) theme and persist the live customizer overrides
   * (accent, mood, corners, typography) from the dashboard theme store.
   *
   * Status/publishedAt are decided by the caller so this never un-suspends a
   * SUSPENDED tenant and never overwrites the original publish timestamp.
   */
  public saveActiveTheme(
    restaurantId: string,
    themeId: string,
    customization: Prisma.InputJsonValue,
    status: Restaurant['status'],
    publishedAt: Date | null,
  ): Promise<Restaurant> {
    return this.db.restaurant.update({
      where: { id: restaurantId },
      data: { themeId, themeCustomization: customization, status, publishedAt },
    });
  }
}
