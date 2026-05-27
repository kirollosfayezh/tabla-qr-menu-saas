'use server';

import { redirect } from 'next/navigation';
import { signOut } from '@/lib/auth/auth';

/** End the current session and return to the home page. */
export async function signOutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect('/');
}
