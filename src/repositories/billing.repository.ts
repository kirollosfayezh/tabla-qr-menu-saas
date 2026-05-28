import { BaseRepository } from './base.repository';
import type { Payment } from '@prisma/client';

/** Read-only queries for the owner billing page. */
export class BillingRepository extends BaseRepository {
  /** Last N payments for a restaurant, newest first. */
  public listPayments(restaurantId: string, limit = 50): Promise<Payment[]> {
    return this.db.payment.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
