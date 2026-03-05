import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_PROJECT_URL || import.meta.env.VITE_SUPABASE_URL || '') as string;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '') as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[supabase] Missing VITE_SUPABASE_PROJECT_URL/VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}
