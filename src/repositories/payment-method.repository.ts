import { Prisma, type PaymentMethodKey, type PaymentMethodSetting } from '@prisma/client';
import { ValidationError } from '@/lib/errors/errors';
import { BaseRepository } from './base.repository';

/** Canonical order the methods are shown to buyers. */
const METHOD_ORDER: ReadonlyArray<PaymentMethodKey> = ['CARD', 'APPLE_PAY', 'INSTAPAY'];

/** Data access for the platform-wide payment-method toggles. */
export class PaymentMethodRepository extends BaseRepository {
  /** All method settings in display order. Missing rows default to active. */
  public async listAll(): Promise<PaymentMethodSetting[]> {
    let rows: PaymentMethodSetting[];
    try {
      rows = await this.db.paymentMethodSetting.findMany();
    } catch (err) {
      if (isMissingSettingsTable(err)) return defaultSettings();
      throw err;
    }
    const byMethod = new Map(rows.map((row) => [row.method, row]));
    return METHOD_ORDER.map(
      (method) => byMethod.get(method) ?? { id: method, method, isActive: true, updatedAt: new Date() },
    );
  }

  /** Method keys currently enabled for checkout. */
  public async listActiveKeys(): Promise<PaymentMethodKey[]> {
    const rows = await this.listAll();
    return rows.filter((row) => row.isActive).map((row) => row.method);
  }

  /** Enable/disable a method, creating the row on first toggle. */
  public async setActive(method: PaymentMethodKey, isActive: boolean): Promise<PaymentMethodSetting> {
    try {
      return await this.db.paymentMethodSetting.upsert({
        where: { method },
        update: { isActive },
        create: { method, isActive },
      });
    } catch (err) {
      if (isMissingSettingsTable(err)) {
        throw new ValidationError('Payment method settings table is missing. Run Prisma db push or migration first.');
      }
      throw err;
    }
  }
}

function defaultSettings(): PaymentMethodSetting[] {
  return METHOD_ORDER.map((method) => ({
    id: method,
    method,
    isActive: true,
    updatedAt: new Date(),
  }));
}

function isMissingSettingsTable(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021';
}
