import type { Payment, PaymentStatus, Prisma } from '@prisma/client';
import { BaseRepository } from '../base.repository';

export interface AdminPaymentFilters {
  status?: PaymentStatus;
  take: number;
  skip: number;
}

export type AdminPaymentRow = Payment & {
  restaurant: { id: string; slug: string; name: string };
  user: { id: string; email: string };
  themePackage: { id: string; name: string } | null;
};

export class AdminPaymentRepository extends BaseRepository {
  public list(filters: AdminPaymentFilters): Promise<AdminPaymentRow[]> {
    return this.db.payment.findMany({
      where: buildWhere(filters),
      include: {
        restaurant: { select: { id: true, slug: true, name: true } },
        user: { select: { id: true, email: true } },
        themePackage: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.take,
      skip: filters.skip,
    });
  }

  public count(filters: Omit<AdminPaymentFilters, 'take' | 'skip'>): Promise<number> {
    return this.db.payment.count({ where: buildWhere(filters) });
  }

  public markRefunded(paymentId: string): Promise<Payment> {
    return this.db.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });
  }

  public sumSuccessfulCents(): Promise<{ _sum: { amountCents: number | null } }> {
    return this.db.payment.aggregate({
      _sum: { amountCents: true },
      where: { status: 'SUCCESS' },
    });
  }
}

function buildWhere(filters: Pick<AdminPaymentFilters, 'status'>): Prisma.PaymentWhereInput {
  return filters.status ? { status: filters.status } : {};
}
