import { z } from 'zod';

/** Treat empty strings in process.env as "not set" for optional fields. */
function preprocessEnv(
  raw: NodeJS.ProcessEnv
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};

  for (const [k, v] of Object.entries(raw)) {
    out[k] = v === '' ? undefined : v;
  }

  return out;
}

/**
 * Typed environment configuration.
 * Validated once at boot; all callers import `env`.
 */
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),

  NEXTAUTH_SECRET: z
    .string()
    .min(32, 'NEXTAUTH_SECRET must be >= 32 chars'),

  NEXTAUTH_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),

  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z
    .string()
    .min(1)
    .optional(),

  TURNSTILE_SECRET_KEY: z
    .string()
    .min(1)
    .optional(),

  APP_ROOT_DOMAIN: z.string().min(3),
  APP_PUBLIC_URL: z.string().url(),

  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),

  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1),

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1)
    .optional(),

  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET: z.string().min(1).optional(),

  R2_PUBLIC_URL: z.string().url().optional(),

  PAYMOB_API_KEY: z.string().min(1).optional(),
  PAYMOB_HMAC_SECRET: z.string().min(1).optional(),
  PAYMOB_INTEGRATION_ID: z.string().min(1).optional(),

  PAYMOB_APPLE_PAY_INTEGRATION_ID: z
    .string()
    .min(1)
    .optional(),

  PAYMOB_IFRAME_ID: z.string().min(1).optional(),

  EMAIL_FROM: z.string().email().optional(),
  RESEND_API_KEY: z.string().min(1).optional(),

  LOG_LEVEL: z
    .enum([
      'fatal',
      'error',
      'warn',
      'info',
      'debug',
      'trace',
    ])
    .default('info'),
});

const envData = preprocessEnv(process.env);

const parsed = EnvSchema.safeParse(envData);

if (!parsed.success) {
  console.error('\n❌ Invalid environment variables\n');

  for (const issue of parsed.error.issues) {
    console.error(
      `• ${issue.path.join('.') || 'unknown'}`
    );

    console.error(`  Message: ${issue.message}`);

    if ('received' in issue) {
      console.error(
        `  Received: ${String(issue.received)}`
      );
    }

    console.error('');
  }

  console.error(
    '\nCurrent env snapshot:\n',
    Object.keys(envData)
  );

  throw new Error(
    'Invalid environment configuration. See errors above.'
  );
}

export const env = Object.freeze(parsed.data);

export type Env = z.infer<typeof EnvSchema>;