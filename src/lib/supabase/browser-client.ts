import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/config/env';

/**
 * Supabase client for use in Client Components (browser).
 * Uses the publishable (anon) key — safe to ship to the browser.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
