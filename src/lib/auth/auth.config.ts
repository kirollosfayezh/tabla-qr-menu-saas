import type { NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/repositories/prisma.client';
import { env } from '@/config/env';
import { buildProviders } from './providers';

/**
 * Auth.js v5 configuration.
 * - JWT sessions (Edge-compatible middleware can read the token).
 * - Credentials (email/password) + Google OAuth.
 * - Roles (`OWNER` / `ADMIN`) flow into the token + session.
 *
 * Bot protection: Turnstile is verified BEFORE calling signIn() on the client,
 * so a successful authorize() implies a verified token.
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  secret: env.NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  providers: buildProviders(),
  callbacks: {
    /** Default new Google users to OWNER unless an ADMIN already exists for that email. */
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return true;
      const email = user.email;
      if (!email) return false;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return true;
      // First-time Google sign-in: PrismaAdapter will create the User row.
      // We do not pre-create here so the adapter manages the Account link.
      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.uid = user.id;
        token.role = (user as { role?: 'OWNER' | 'ADMIN' }).role;
      }
      // Re-read role from DB on initial login, explicit update triggers, and once an hour
      // afterwards so admin promotions/demotions take effect without forcing a re-login.
      if (token.uid) {
        const stale = !token.role || trigger === 'update' || isRoleRefreshDue(token.roleRefreshedAt as number | undefined);
        if (stale) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.uid as string },
            select: { role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.roleRefreshedAt = Date.now();
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role;
      }
      return session;
    },
  },
  trustHost: true,
};

const ROLE_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

function isRoleRefreshDue(lastRefreshedAt: number | undefined): boolean {
  if (!lastRefreshedAt) return true;
  return Date.now() - lastRefreshedAt > ROLE_REFRESH_INTERVAL_MS;
}
