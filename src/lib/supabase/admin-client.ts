import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

let cached: SupabaseClient | null = null;

/**
 * Admin Supabase client using the service-role key.
 * SERVER-ONLY — bypasses Row-Level Security. Never import from client code.
 * Use for: storage uploads with admin perms, server-to-server operations.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin client.');
  }
  if (cached) return cached;
  cached = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
