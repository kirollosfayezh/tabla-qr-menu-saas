'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { isSupportedLocale } from '@/i18n/config';

/** Persist the chosen UI locale in a cookie and refresh the current page. */
export async function setLocaleCookie(locale: string): Promise<void> {
  if (!isSupportedLocale(locale)) return;
  const store = await cookies();
  store.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  revalidatePath('/');
}
