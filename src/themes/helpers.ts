/** Cross-theme helpers used by built-in diner themes. */

/** Pick the locale-appropriate text, falling back to the other locale if missing. */
export function localizedField(
  primary: string,
  arabic: string | null,
  locale: 'en' | 'ar',
): string {
  if (locale === 'ar') return arabic && arabic.trim().length > 0 ? arabic : primary;
  return primary;
}

/** Format an integer price (minor units) with Intl. Falls back to a plain string. */
export function formatPriceForLocale(
  priceCents: number,
  currencyCode: string,
  locale: 'en' | 'ar',
): string {
  const intlLocale = locale === 'ar' ? 'ar-EG' : 'en-US';
  try {
    return new Intl.NumberFormat(intlLocale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2,
    }).format(priceCents / 100);
  } catch {
    return `${(priceCents / 100).toFixed(2)} ${currencyCode}`;
  }
}
