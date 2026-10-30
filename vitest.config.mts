import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Unit tests run in plain Node with no database or network. `src/config/env.ts`
 * validates process.env at import time, so the suite supplies harmless placeholders.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'fatal',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/tabla_test',
      NEXTAUTH_SECRET: 'test-secret-that-is-at-least-32-characters',
      NEXTAUTH_URL: 'http://localhost:3000',
      APP_ROOT_DOMAIN: 'tabla.test',
      APP_PUBLIC_URL: 'http://localhost:3000',
      UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
      UPSTASH_REDIS_REST_TOKEN: 'test-token',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key',
      PAYMOB_HMAC_SECRET: 'test-paymob-hmac-secret',
    },
  },
});
