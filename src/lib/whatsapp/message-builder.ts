import { MAX_WA_URL_BYTES } from '@/config/constants';
import type { MessageBuildInput } from './types';

const EN = {
  order: 'Order',
  table: 'Table',
  fulfillment: 'Type',
  dineIn: 'Dine-in',
  delivery: 'Delivery',
  customer: 'Customer',
  phone: 'Phone',
  address: 'Address',
  notes: 'Notes',
  subtotal: 'Subtotal',
  tax: 'Tax',
  service: 'Service',
  total: 'Total',
  powered: 'Powered by Tabla',
};

const AR = {
  order: 'طلب',
  table: 'طاولة',
  fulfillment: 'النوع',
  dineIn: 'داخل المطعم',
  delivery: 'توصيل',
  customer: 'العميل',
  phone: 'الهاتف',
  address: 'العنوان',
  notes: 'ملاحظات',
  subtotal: 'المجموع الفرعي',
  tax: 'الضريبة',
  service: 'الخدمة',
  total: 'الإجمالي',
  powered: 'مدعوم من طبلة',
};

export function buildOrderMessage(input: MessageBuildInput): string {
  const labels = input.locale === 'ar' ? AR : EN;
  const restaurant = localize(input.restaurant.name, input.restaurant.nameAr, input.locale);
  const rows = input.order.lines.map((line) => lineText(line, input.order.currencyCode, input.locale));
  const fulfillment = input.order.fulfillmentType === 'DELIVERY' ? labels.delivery : labels.dineIn;
  const details = [
    `${labels.fulfillment}: ${fulfillment}`,
    input.order.tableNumber ? `${labels.table}: ${input.order.tableNumber}` : null,
    input.order.customerName ? `${labels.customer}: ${input.order.customerName}` : null,
    input.order.customerPhone ? `${labels.phone}: ${input.order.customerPhone}` : null,
    input.order.deliveryAddress ? `${labels.address}: ${input.order.deliveryAddress}` : null,
  ].filter((line): line is string => Boolean(line));
  return [
    `${labels.order} #${input.order.id.slice(0, 8)}`,
    restaurant,
    ...details,
    '',
    ...rows,
    '',
    `${labels.subtotal}: ${money(input.order.subtotalCents, input.order.currencyCode, input.locale)}`,
    `${labels.tax}: ${money(input.order.taxCents, input.order.currencyCode, input.locale)}`,
    `${labels.service}: ${money(input.order.serviceCents, input.order.currencyCode, input.locale)}`,
    `${labels.total}: ${money(input.order.totalCents, input.order.currencyCode, input.locale)}`,
    '',
    labels.powered,
  ].join('\n');
}

export function buildDeepLink(whatsappNumber: string, message: string): { url: string; encodedLength: number } {
  const number = whatsappNumber.replace(/^\+/, '').replace(/\s+/g, '');
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  return { url, encodedLength: new TextEncoder().encode(url).length };
}

export function isTooLongForWhatsApp(encodedLength: number): boolean {
  return encodedLength > MAX_WA_URL_BYTES;
}

function lineText(
  line: MessageBuildInput['order']['lines'][number],
  currencyCode: string,
  locale: 'en' | 'ar',
): string {
  const labels = locale === 'ar' ? AR : EN;
  const name = localize(line.name, line.nameAr, locale);
  const total = money(line.lineTotalCents, currencyCode, locale);
  const selections = line.selections?.length
    ? '\n' + line.selections.map((s) => {
      const group = localize(s.groupName, s.groupNameAr, locale);
      const label = localize(s.optionLabel, s.optionLabelAr, locale);
      const delta = s.priceDeltaCents === 0
        ? ''
        : ` (${s.priceDeltaCents > 0 ? '+' : ''}${money(s.priceDeltaCents, currencyCode, locale)})`;
      return `  - ${group}: ${label}${delta}`;
    }).join('\n')
    : '';
  const notes = line.notes ? `\n  ${labels.notes}: ${line.notes}` : '';
  return `${line.qty} x ${name} - ${total}${selections}${notes}`;
}

function localize(en: string, ar: string | null, locale: 'en' | 'ar'): string {
  return locale === 'ar' && ar && ar.trim().length > 0 ? ar : en;
}

function money(cents: number, currencyCode: string, locale: 'en' | 'ar'): string {
  const intlLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  return new Intl.NumberFormat(intlLocale, { style: 'currency', currency: currencyCode }).format(cents / 100);
}
