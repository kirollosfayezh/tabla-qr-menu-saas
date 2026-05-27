import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

/** Auth.js v5 entry — re-exported handlers and helpers. */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
