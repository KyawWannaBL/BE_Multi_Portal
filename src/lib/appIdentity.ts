import { supabase } from "@/lib/supabase";
import { normalizeRole } from "@/lib/rbac";

export type AppIdentity = {
  auth_user_id: string;
  email: string | null;
  user_id: string | null;
  merchant_id: string | null;
  customer_id: string | null;
  user_enhanced_id: string | null;
  admin_user_id: string | null;
  primary_role: string | null;
};

async function safeMaybeSingle<T>(query: Promise<{ data: T | null; error: any }>) {
  const { data, error } = await query;
  if (error) {
    const code = (error as any).code;
    // missing relation / column → ignore and return null so we can fallback
    if (code === "42P01" || code === "42703") return { data: null as T | null, error };
    console.warn("[identity] query failed:", { code, message: error.message });
    return { data: null as T | null, error };
  }
  return { data, error: null };
}

/**
 * Resolves the logged-in user's linked IDs across common Britium tables.
 *
 * Primary strategy:
 * - Select from `public.app_identities` view (recommended migration in /supabase/migrations).
 * Fallback strategy (works without the view):
 * - Look up `users_enhanced` by auth_user_id / email
 * - Look up `admin_users_2026_02_04_16_00` by email
 * - Look up `public.users` by email
 * - Look up `merchants` / `customers` by email
 */
export async function getCurrentIdentity(): Promise<AppIdentity | null> {
  const { data: session } = await supabase.auth.getSession();
  const u = session.session?.user;
  if (!u) return null;

  const email = (u.email || "").trim().toLowerCase() || null;

  // 1) Preferred: view (does not require direct access to auth schema)
  const viewRes = await safeMaybeSingle<AppIdentity>(
    supabase.from("app_identities").select("*").maybeSingle() as any
  );
  if (viewRes.data) return viewRes.data;

  // 2) Fallback: build identity manually (best-effort)
  const out: AppIdentity = {
    auth_user_id: u.id,
    email,
    user_id: null,
    merchant_id: null,
    customer_id: null,
    user_enhanced_id: null,
    admin_user_id: null,
    primary_role: normalizeRole((u.app_metadata as any)?.role || (u.user_metadata as any)?.role) ?? null,
  };

  const ue = await safeMaybeSingle<any>(
    supabase.from("users_enhanced").select("id, role, auth_user_id, email").or(`auth_user_id.eq.${u.id},email.eq.${email}`).maybeSingle() as any
  );
  if (ue.data) {
    out.user_enhanced_id = ue.data.id ?? null;
    out.primary_role = normalizeRole(ue.data.role) ?? out.primary_role;
  }

  const au = await safeMaybeSingle<any>(
    supabase.from("admin_users_2026_02_04_16_00").select("id, role, email").eq("email", email).maybeSingle() as any
  );
  if (au.data) {
    out.admin_user_id = au.data.id ?? null;
    out.primary_role = normalizeRole(au.data.role) ?? out.primary_role;
  }

  const pu = await safeMaybeSingle<any>(
    supabase.from("users").select("id, role, email").eq("email", email).maybeSingle() as any
  );
  if (pu.data) {
    out.user_id = pu.data.id ?? null;
    out.primary_role = normalizeRole(pu.data.role) ?? out.primary_role;
  }

  const mer = await safeMaybeSingle<any>(
    supabase.from("merchants").select("id, email").eq("email", email).maybeSingle() as any
  );
  if (mer.data) out.merchant_id = mer.data.id ?? null;

  const cus = await safeMaybeSingle<any>(
    supabase.from("customers").select("id, email, phone").or(`email.eq.${email}`).maybeSingle() as any
  );
  if (cus.data) out.customer_id = cus.data.id ?? null;

  return out;
}
