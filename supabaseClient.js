import { createClient } from '@supabase/supabase-js'

// Vite requires import.meta.env, NOT process.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 VITE ERROR: Keys are missing from the environment!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
