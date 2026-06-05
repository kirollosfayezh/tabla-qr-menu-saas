'use server';

import { headers } from 'next/headers';
import { ZodError } from 'zod';
import { PlaceOrderSchema } from '@/dtos/order.dto';
import { env } from '@/config/env';
import { enforceRateLimit } from '@/lib/security/rate-limiter';
import { toAppError } from '@/lib/errors/error-handler';
import { logger } from '@/lib/logger';
import { buildDeepLink, buildOrderMessage, isTooLongForWhatsApp } from '@/lib/whatsapp/message-builder';
import { OrderService } from '@/services/order.service';

export type OrderActionResult<T = undefined> =
  | { ok: true; value: T }
  | { ok: false; code: string; message: string; fieldErrors?: Record<string, string> };

export interface PlaceOrderResult {
  orderId: string;
  url: string;
  fallback: boolean;
}

export async function placeOrderAction(
  slug: string,
  input: unknown,
): Promise<OrderActionResult<PlaceOrderResult>> {
  try {
    const ip = await clientIp();
    await enforceRateLimit('order', `ip:${ip}:tenant:${slug}`);
    const parsed = PlaceOrderSchema.parse(input);
    const placed = await new OrderService().placeOrder(slug, parsed);
    const order = {
      id: placed.orderId,
      fulfillmentType: placed.fulfillmentType,
      tableNumber: placed.tableNumber,
      customerName: placed.customerName,
      customerPhone: placed.customerPhone,
      deliveryAddress: placed.deliveryAddress,
      deliveryLat: placed.deliveryLat,
      deliveryLng: placed.deliveryLng,
      subtotalCents: placed.subtotalCents,
      taxCents: placed.taxCents,
      serviceCents: placed.serviceCents,
      totalCents: placed.totalCents,
      currencyCode: placed.currencyCode,
      lines: placed.lines,
    };
    const message = buildOrderMessage({ restaurant: placed.restaurant, order, locale: parsed.locale });
    const link = buildDeepLink(placed.restaurant.whatsappNumber, message);
    if (isTooLongForWhatsApp(link.encodedLength)) {
      return { ok: true, value: summaryResult(placed.orderId, placed.restaurant.whatsappNumber, parsed.locale) };
    }
    return { ok: true, value: { orderId: placed.orderId, url: link.url, fallback: false } };
  } catch (err) {
    return toFailure(err);
  }
}

async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

function summaryResult(orderId: string, whatsappNumber: string, locale: 'en' | 'ar'): PlaceOrderResult {
  const summaryUrl = `${env.APP_PUBLIC_URL.replace(/\/$/, '')}/o/${orderId}`;
  const label = locale === 'ar' ? 'طلب' : 'Order';
  const message = `${label} #${orderId.slice(0, 8)}: ${summaryUrl}`;
  const link = buildDeepLink(whatsappNumber, message);
  return {
    orderId,
    url: link.url,
    fallback: true,
  };
}

function toFailure(err: unknown): Extract<OrderActionResult, { ok: false }> {
  if (err instanceof ZodError) {
    const fieldErrors = zodFields(err);
    const first = Object.values(fieldErrors)[0] ?? 'Invalid input';
    return { ok: false, code: 'VALIDATION_ERROR', message: first, fieldErrors };
  }
  const e = toAppError(err);
  logger.warn({ code: e.code }, 'order action rejected');
  return { ok: false, code: e.code, message: e.message };
}

function zodFields(err: ZodError): Record<string, string> {
  const flat = err.flatten();
  const fieldErrors: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(flat.fieldErrors)) {
    const list = msgs as string[] | undefined;
    if (list?.[0]) fieldErrors[key] = list[0];
  }
  return fieldErrors;
}
