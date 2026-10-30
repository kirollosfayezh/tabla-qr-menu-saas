import { describe, expect, it } from 'vitest';
import { buildDeepLink, buildOrderMessage, isTooLongForWhatsApp, mapsUrl } from './message-builder';
import type { MessageBuildInput } from './types';

function input(locale: 'en' | 'ar'): MessageBuildInput {
  return {
    locale,
    restaurant: { name: 'Cafe Nile', nameAr: 'كافيه النيل', whatsappNumber: '+20 100 000 0001' },
    order: {
      id: 'abcdef1234567890',
      fulfillmentType: 'DELIVERY',
      tableNumber: null,
      customerName: 'Mona',
      customerPhone: '+201234',
      deliveryAddress: '1 Nile St',
      deliveryLat: 30.04,
      deliveryLng: 31.23,
      subtotalCents: 10000,
      taxCents: 1400,
      serviceCents: 0,
      totalCents: 11400,
      currencyCode: 'USD',
      lines: [{
        qty: 2, name: 'Koshari', nameAr: 'كشري', priceCents: 4000, lineTotalCents: 10000, notes: 'No onions',
        selections: [{ groupName: 'Size', groupNameAr: 'الحجم', optionLabel: 'Large', optionLabelAr: 'كبير', priceDeltaCents: 1000 }],
      }],
    },
  };
}

describe('WhatsApp order message', () => {
  it('builds an English message with short id, details, selections, notes and totals', () => {
    const text = buildOrderMessage(input('en'));
    expect(text).toContain('Order #abcdef12');
    expect(text).toContain('Type: Delivery');
    expect(text).toContain('Location: https://maps.google.com/?q=30.04,31.23');
    expect(text).toContain('2 x Koshari - $100.00');
    expect(text).toContain('  - Size: Large (+$10.00)');
    expect(text).toContain('  Notes: No onions');
    expect(text).toContain('Total: $114.00');
  });

  it('uses Arabic labels and Arabic names when the diner chose Arabic', () => {
    const text = buildOrderMessage(input('ar'));
    expect(text).toContain('كافيه النيل');
    expect(text).toContain('كشري');
    expect(text).toContain('الإجمالي');
  });

  it('builds a wa.me link with the number normalized and the text encoded', () => {
    const { url, encodedLength } = buildDeepLink('+20 100 000 0001', 'Hi & bye');
    expect(url).toBe('https://wa.me/201000000001?text=Hi%20%26%20bye');
    expect(encodedLength).toBe(url.length);
    expect(isTooLongForWhatsApp(2048)).toBe(false);
    expect(isTooLongForWhatsApp(2049)).toBe(true);
  });

  it('omits the maps link without both coordinates', () => {
    expect(mapsUrl(null, 31)).toBeNull();
    expect(mapsUrl(30, 0)).toBe('https://maps.google.com/?q=30,0');
  });
});
