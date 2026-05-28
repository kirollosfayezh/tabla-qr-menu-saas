import { env } from '@/config/env';
import { PAYMOB_PAYMENT_EXPIRATION_SECONDS } from '@/config/constants';
import { PaymentError } from '@/lib/errors/errors';
import type {
  PaymobCheckout,
  PaymobCheckoutInput,
  PaymobRefundInput,
  PaymobRefundResult,
} from './paymob.types';

const BASE_URL = 'https://accept.paymob.com/api';

export class PaymobAdapter {
  public async createCheckout(input: PaymobCheckoutInput): Promise<PaymobCheckout> {
    this.assertConfigured();
    const authToken = await this.authenticate();
    const providerOrderId = await this.registerOrder(authToken, input);
    const paymentToken = await this.paymentKey(authToken, providerOrderId, input);
    return {
      providerOrderId: String(providerOrderId),
      iframeUrl: `${BASE_URL}/acceptance/iframes/${env.PAYMOB_IFRAME_ID}?payment_token=${paymentToken}`,
    };
  }

  /**
   * Refund a Paymob transaction in full or partial.
   * Calls `/acceptance/void_refund/refund` with an auth token; throws on any non-2xx.
   */
  public async refund(input: PaymobRefundInput): Promise<PaymobRefundResult> {
    this.assertConfigured();
    const authToken = await this.authenticate();
    const body = await postJson(`${BASE_URL}/acceptance/void_refund/refund`, {
      auth_token: authToken,
      transaction_id: Number(input.transactionId),
      amount_cents: input.amountCents,
    });
    const refundId = isRecord(body) && (typeof body.id === 'number' || typeof body.id === 'string') ? String(body.id) : null;
    if (!refundId) throw new PaymentError('Invalid Paymob refund response');
    const success = isRecord(body) && body.success === true;
    return { refundTransactionId: refundId, success };
  }

  private assertConfigured(): void {
    if (!env.PAYMOB_API_KEY || !env.PAYMOB_INTEGRATION_ID || !env.PAYMOB_IFRAME_ID) {
      throw new PaymentError('Paymob is not configured');
    }
  }

  private async authenticate(): Promise<string> {
    const body = await postJson(`${BASE_URL}/auth/tokens`, { api_key: env.PAYMOB_API_KEY });
    return readString(body, 'token');
  }

  private async registerOrder(token: string, input: PaymobCheckoutInput): Promise<number> {
    const body = await postJson(`${BASE_URL}/ecommerce/orders`, {
      auth_token: token,
      delivery_needed: false,
      amount_cents: input.amountCents,
      currency: input.currencyCode,
      merchant_order_id: input.paymentId,
      items: [],
    });
    return readNumber(body, 'id');
  }

  private async paymentKey(
    token: string,
    providerOrderId: number,
    input: PaymobCheckoutInput,
  ): Promise<string> {
    const body = await postJson(`${BASE_URL}/acceptance/payment_keys`, {
      auth_token: token,
      amount_cents: input.amountCents,
      expiration: PAYMOB_PAYMENT_EXPIRATION_SECONDS,
      order_id: providerOrderId,
      billing_data: input.billingData,
      currency: input.currencyCode,
      integration_id: Number(integrationId(input.method)),
    });
    return readString(body, 'token');
  }
}

function integrationId(method: 'card' | 'applePay'): string {
  if (method === 'card') return env.PAYMOB_INTEGRATION_ID ?? '';
  if (env.PAYMOB_APPLE_PAY_INTEGRATION_ID) return env.PAYMOB_APPLE_PAY_INTEGRATION_ID;
  throw new PaymentError('Paymob Apple Pay is not configured');
}

async function postJson(url: string, payload: unknown): Promise<unknown> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new PaymentError('Paymob request failed', { status: res.status });
  return res.json();
}

function readString(value: unknown, key: string): string {
  if (!isRecord(value) || typeof value[key] !== 'string') throw new PaymentError('Invalid Paymob response');
  return value[key];
}

function readNumber(value: unknown, key: string): number {
  if (!isRecord(value) || typeof value[key] !== 'number') throw new PaymentError('Invalid Paymob response');
  return value[key];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
