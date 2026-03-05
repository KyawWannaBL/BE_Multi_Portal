import { supabase } from "@/lib/supabase";
import { getCurrentIdentity } from "@/lib/appIdentity";

/**
 * Backward-compatible profile fetcher used by older RBAC components.
 * Prefers the `profiles` table if present, otherwise falls back to `app_identities`.
 */
export async function getMyProfile() {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user?.id;
  if (!userId) return { userId: null, profile: null };

  // Try profiles table (may not exist in some deployments)
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  if (!error && profile) return { userId, profile };

  // Fallback: return identity as a profile-like object
  const identity = await getCurrentIdentity();
  return { userId, profile: identity };
}
