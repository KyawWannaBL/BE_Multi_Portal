import { createClient } from '@supabase/supabase-js';

// Strictly use Vite's import.meta.env format
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 CONFIG ERROR: Supabase keys are missing from the environment!");
  console.error("- URL found:", supabaseUrl ? "Yes" : "No");
  console.error("- Key found:", supabaseAnonKey ? "Yes" : "No");
  console.error("Make sure your Vercel Environment Variables are exactly 'VITE_SUPABASE_URL' and 'VITE_SUPABASE_ANON_KEY'");
}

// Initialize the client (with fallbacks so it doesn't fatally crash the whole page rendering)
export const supabase = createClient(
  supabaseUrl || "https://missing-url.supabase.co",
  supabaseAnonKey || "missing-key"
);
