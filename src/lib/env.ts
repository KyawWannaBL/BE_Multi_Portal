export function validateEnv(): { ok: true } | { ok: false; missing: string[] } {
  const url = (import.meta.env.VITE_SUPABASE_PROJECT_URL || import.meta.env.VITE_SUPABASE_URL || "") as string;
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || "") as string;

  const missing: string[] = [];
  if (!url.trim()) missing.push("VITE_SUPABASE_PROJECT_URL (or VITE_SUPABASE_URL)");
  if (!key.trim()) missing.push("VITE_SUPABASE_ANON_KEY");

  return missing.length ? { ok: false, missing } : { ok: true };
}
