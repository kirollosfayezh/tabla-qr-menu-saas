import { createHash } from 'crypto';
import type { Prisma } from '@prisma/client';
import { AnalyticsEventRepository } from '@/repositories/analytics-event.repository';
import { RestaurantRepository } from '@/repositories/restaurant.repository';
import type { AnalyticsEventDTO } from '@/dtos/analytics.dto';
import { NotFoundError } from '@/lib/errors/errors';

/**
 * Diner-side analytics ingestion.
 * - Validates the restaurant exists and is ACTIVE (no events for unpaid tenants).
 * - SHA-256-hashes the client sessionId so we never store the raw value.
 * - Metadata is restricted to scalar values at the DTO layer.
 */
export class AnalyticsService {
  constructor(
    private readonly events: AnalyticsEventRepository = new AnalyticsEventRepository(),
    private readonly restaurants: RestaurantRepository = new RestaurantRepository(),
  ) {}

  public async record(input: AnalyticsEventDTO): Promise<void> {
    const restaurant = await this.restaurants.findById(input.restaurantId);
    if (!restaurant) throw new NotFoundError('Restaurant');
    if (restaurant.status !== 'ACTIVE') return; // silently drop — don't leak status

    await this.events.create({
      restaurantId: input.restaurantId,
      eventType: input.eventType,
      sessionId: input.sessionId ? hashSession(input.sessionId) : null,
      metadata: (input.metadata ?? null) as Prisma.InputJsonValue | null,
    });
  }
}

function hashSession(raw: string): string {
  return createHash('sha256').update(raw).digest('hex').slice(0, 32);
}
