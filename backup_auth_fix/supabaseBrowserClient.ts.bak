import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser-only Supabase client singleton.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
 * Persistent session enabled to avoid repeated logins.
 */
let _client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) return null;

  if (!_client) {
    _client = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
      }
    });
  }

  return _client;
}
