import type { Payment, PaymentStatus, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export interface CreatePaymentInput {
  restaurantId: string;
  userId: string;
  amountCents: number;
  currencyCode: string;
  themeId: string | null;
  rawWebhookPayload: Prisma.InputJsonValue;
}

export interface RecordWebhookEventInput {
  paymentId: string | null;
  providerOrderId: string | null;
  hmacValid: boolean;
  payload: Prisma.InputJsonValue;
}

export class PaymentRepository extends BaseRepository {
  /**
   * Insert a new pending Payment.
   * Uses Prisma model API for the base columns and a raw UPDATE for `theme_id` so the
   * repo compiles before the next `prisma generate` picks up the new column.
   */
  public async create(input: CreatePaymentInput): Promise<Payment> {
    const created = await this.db.payment.create({
      data: {
        restaurantId: input.restaurantId,
        userId: input.userId,
        amountCents: input.amountCents,
        currencyCode: input.currencyCode,
        rawWebhookPayload: input.rawWebhookPayload,
      },
    });
    if (input.themeId) {
      await this.db.$executeRaw`UPDATE payments SET theme_id = ${input.themeId}::uuid WHERE id = ${created.id}::uuid`;
    }
    return created;
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

  public findById(paymentId: string): Promise<Payment | null> {
    return this.db.payment.findUnique({ where: { id: paymentId } });
  }

  /** Read `theme_id` from a Payment row via raw SQL (column not yet in the generated client). */
  public async findThemeIdFor(paymentId: string): Promise<string | null> {
    const rows = await this.db.$queryRaw<Array<{ theme_id: string | null }>>`
      SELECT theme_id FROM payments WHERE id = ${paymentId}::uuid
    `;
    return rows[0]?.theme_id ?? null;
  }

  /**
   * Move a payment to a terminal status.
   * `paidAt` is only set on the SUCCESS transition; never cleared on subsequent writes.
   */
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
        paidAt: status === 'SUCCESS' ? new Date() : undefined,
      },
    });
  }

  /**
   * Append-only audit row for every incoming Paymob webhook call, valid or not.
   * Uses raw SQL until the next `prisma generate` picks up the new table.
   */
  public async recordWebhookEvent(input: RecordWebhookEventInput): Promise<void> {
    const payloadJson = JSON.stringify(input.payload);
    await this.db.$executeRaw`
      INSERT INTO payment_webhook_events (id, payment_id, provider_order_id, hmac_valid, payload, received_at)
      VALUES (
        gen_random_uuid(),
        ${input.paymentId}::uuid,
        ${input.providerOrderId},
        ${input.hmacValid},
        ${payloadJson}::jsonb,
        NOW()
      )
    `;
  }
}
