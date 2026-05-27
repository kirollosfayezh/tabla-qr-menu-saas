import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type SupportedLocale } from '@/config/constants';

export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
export type { SupportedLocale };

/** Returns the writing direction for the given locale. */
export function getDirection(locale: SupportedLocale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** Whether the given string is a supported locale. */
export function isSupportedLocale(input: string): input is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(input);
}
