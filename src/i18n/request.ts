import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, isSupportedLocale } from './config';

/**
 * Resolves the active locale for the current request.
 * Priority: cookie → Accept-Language → DEFAULT_LOCALE.
 */
export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;

  let locale = DEFAULT_LOCALE;
  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const hdrs = await headers();
    const accept = hdrs.get('accept-language') ?? '';
    if (accept.toLowerCase().startsWith('ar')) locale = 'ar';
  }

  const messages = (await import(`./locales/${locale}.json`)).default;
  return { locale, messages };
});
