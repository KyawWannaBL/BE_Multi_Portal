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
  supabaseUrl || "https://dltavabvjwocknkyvwgz.supabase.co",
  supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTMxOTQsImV4cCI6MjA4NjY4OTE5NH0.7-9BK6L9dpCYIB-pp1WOeQxCI1DVxnSykoTRXNUHYIo"
);
