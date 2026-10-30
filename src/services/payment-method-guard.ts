import type { PaymentMethodRepository } from '@/repositories/payment-method.repository';
import { ValidationError } from '@/lib/errors/errors';
import { METHOD_ID_TO_KEY, type PaymentMethodId } from '@/lib/payments/payment-methods';

/** Throw unless the admin has the given checkout method switched on. */
export async function assertPaymentMethodActive(
  paymentMethods: Pick<PaymentMethodRepository, 'listActiveKeys'>,
  method: PaymentMethodId,
): Promise<void> {
  const activeKeys = await paymentMethods.listActiveKeys();
  if (!activeKeys.includes(METHOD_ID_TO_KEY[method])) {
    throw new ValidationError('This payment method is currently unavailable');
  }
}
