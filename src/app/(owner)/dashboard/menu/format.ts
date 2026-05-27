/** Display utilities for the menu UI. */

/** Format integer minor units as a localized currency string. */
export function formatPrice(priceCents: number, currencyCode: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} ${currencyCode}`;
  }
}

/** Parse a localized price string back into minor units. Returns NaN on failure. */
export function parsePriceInput(raw: string): number {
  const cleaned = raw.replace(/[^\d.,-]/g, '').replace(',', '.');
  const value = Number.parseFloat(cleaned);
  if (!Number.isFinite(value)) return Number.NaN;
  return Math.max(0, Math.round(value * 100));
}
