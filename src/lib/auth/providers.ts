import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { Provider } from 'next-auth/providers';
import { z } from 'zod';
import { prisma } from '@/repositories/prisma.client';
import { verifyPassword } from './password';
import { env } from '@/config/env';

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

/** Email + password provider. Used after Turnstile verification on the client. */
function buildCredentialsProvider(): Provider {
  return Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const parsed = CredentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const ok = await verifyPassword(password, user.passwordHash);
      if (!ok) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role as 'OWNER' | 'ADMIN',
      };
    },
  });
}

/** Google OAuth provider — only registered when env vars are present. */
function buildGoogleProvider(): Provider | null {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) return null;
  return Google({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: { prompt: 'consent', access_type: 'offline', response_type: 'code' },
    },
    // Google verifies emails on its side, so we let users link their Google login
    // to an existing User row created via email/password if the verified Google
    // email matches. Without this, signup-then-google fails with OAuthAccountNotLinked.
    allowDangerousEmailAccountLinking: true,
  });
}

/** Assemble the active providers list. */
export function buildProviders(): Provider[] {
  const list: Provider[] = [buildCredentialsProvider()];
  const google = buildGoogleProvider();
  if (google) list.push(google);
  return list;
}
