import type { Payment, PaymentStatus, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CreatePaymentInput {
  restaurantId: string;
  userId: string;
  amountCents: number;
  currencyCode: string;
  rawWebhookPayload: Prisma.InputJsonValue;
}

export class PaymentRepository extends BaseRepository {
  public create(input: CreatePaymentInput): Promise<Payment> {
    return this.db.payment.create({
      data: {
        restaurantId: input.restaurantId,
        userId: input.userId,
        amountCents: input.amountCents,
        currencyCode: input.currencyCode,
        rawWebhookPayload: input.rawWebhookPayload,
      },
    });
  }

  public setProviderOrder(paymentId: string, providerOrderId: string): Promise<Payment> {
    return this.db.payment.update({
      where: { id: paymentId },
      data: { providerOrderId },
    });
  }

  public findByProviderOrderId(providerOrderId: string): Promise<Payment | null> {
    return this.db.payment.findFirst({ where: { providerOrderId } });
  }

  public updateStatus(
    paymentId: string,
    status: PaymentStatus,
    payload: Prisma.InputJsonValue,
    providerTransactionId?: string,
  ): Promise<Payment> {
    return this.db.payment.update({
      where: { id: paymentId },
      data: {
        status,
        providerTransactionId,
        rawWebhookPayload: payload,
        paidAt: status === 'SUCCESS' ? new Date() : null,
      },
    });
  }
}
