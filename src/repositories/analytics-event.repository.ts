import type { AnalyticsEvent, AnalyticsEventType, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface AnalyticsEventInput {
  restaurantId: string;
  eventType: AnalyticsEventType;
  sessionId: string | null;
  metadata: Prisma.InputJsonValue | null;
}

export interface EventCountRow {
  eventType: AnalyticsEventType;
  count: number;
}

export interface ItemViewRow {
  itemId: string;
  count: number;
}

export class AnalyticsEventRepository extends BaseRepository {
  public create(input: AnalyticsEventInput): Promise<AnalyticsEvent> {
    return this.db.analyticsEvent.create({
      data: {
        restaurantId: input.restaurantId,
        eventType: input.eventType,
        sessionId: input.sessionId,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  /** Group events by type over the given window. */
  public async countByType(restaurantId: string, since: Date): Promise<EventCountRow[]> {
    const rows = await this.db.analyticsEvent.groupBy({
      by: ['eventType'],
      where: { restaurantId, occurredAt: { gte: since } },
      _count: { _all: true },
    });
    return rows.map((row) => ({ eventType: row.eventType, count: row._count._all }));
  }

  /** Top items by ITEM_VIEW count for the restaurant. */
  public async topItems(restaurantId: string, since: Date, limit: number): Promise<ItemViewRow[]> {
    const rows = await this.db.$queryRaw<Array<{ item_id: string; count: bigint }>>`
      SELECT (metadata->>'itemId') AS item_id, COUNT(*)::bigint AS count
      FROM analytics_events
      WHERE restaurant_id = ${restaurantId}::uuid
        AND event_type = 'ITEM_VIEW'
        AND occurred_at >= ${since}
        AND metadata ? 'itemId'
      GROUP BY item_id
      ORDER BY count DESC
      LIMIT ${limit}
    `;
    return rows.map((row) => ({ itemId: row.item_id, count: Number(row.count) }));
  }

  /** Monthly PAGE_VIEW counts. */
  public async monthlyPageViews(restaurantId: string, since: Date): Promise<Array<{ month: string; count: number }>> {
    const rows = await this.db.$queryRaw<Array<{ month: string; count: bigint }>>`
      SELECT to_char(date_trunc('month', occurred_at), 'YYYY-MM') AS month, COUNT(*)::bigint AS count
      FROM analytics_events
      WHERE restaurant_id = ${restaurantId}::uuid AND event_type = 'PAGE_VIEW' AND occurred_at >= ${since}
      GROUP BY month ORDER BY month ASC
    `;
    return rows.map((r) => ({ month: r.month, count: Number(r.count) }));
  }

  /** Hourly distribution (0-23) of page views. */
  public async hourlyDistribution(restaurantId: string, since: Date): Promise<Array<{ hour: number; count: number }>> {
    const rows = await this.db.$queryRaw<Array<{ hour: number; count: bigint }>>`
      SELECT EXTRACT(HOUR FROM occurred_at)::int AS hour, COUNT(*)::bigint AS count
      FROM analytics_events
      WHERE restaurant_id = ${restaurantId}::uuid AND event_type = 'PAGE_VIEW' AND occurred_at >= ${since}
      GROUP BY hour ORDER BY hour ASC
    `;
    const map = new Map(rows.map((r) => [r.hour, Number(r.count)]));
    return Array.from({ length: 24 }, (_, h) => ({ hour: h, count: map.get(h) ?? 0 }));
  }

  /** Daily PAGE_VIEW counts for a sparkline. */
  public async dailyPageViews(restaurantId: string, since: Date): Promise<Array<{ day: string; count: number }>> {
    const rows = await this.db.$queryRaw<Array<{ day: string; count: bigint }>>`
      SELECT to_char(date_trunc('day', occurred_at), 'YYYY-MM-DD') AS day, COUNT(*)::bigint AS count
      FROM analytics_events
      WHERE restaurant_id = ${restaurantId}::uuid
        AND event_type = 'PAGE_VIEW'
        AND occurred_at >= ${since}
      GROUP BY day
      ORDER BY day ASC
    `;
    return rows.map((row) => ({ day: row.day, count: Number(row.count) }));
  }
}
