import { supabase } from "@/lib/supabase";

export type PublicUser = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
};

export type Merchant = {
  id: string;
  business_name: string;
  email: string;
  phone: string;
};

export type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string;
};

export async function getAuthIdentity(): Promise<{ authUserId: string | null; email: string | null }> {
  const { data } = await supabase.auth.getSession();
  return { authUserId: data.session?.user?.id ?? null, email: data.session?.user?.email ?? null };
}

async function safeMaybeSingle<T>(promise: Promise<any>): Promise<T | null> {
  try {
    const { data, error } = await promise;
    if (error) return null;
    return (data as T) ?? null;
  } catch {
    return null;
  }
}

/**
 * Legacy DB uses public.users (not auth.users) for internal identity references.
 * We resolve the current staff record by email where possible.
 */
export async function getPublicUserByEmail(email: string): Promise<PublicUser | null> {
  return safeMaybeSingle<PublicUser>(
    supabase.from("users").select("id, email, full_name, phone, role").eq("email", email).maybeSingle()
  );
}

export async function getMerchantByEmail(email: string): Promise<Merchant | null> {
  return safeMaybeSingle<Merchant>(
    supabase.from("merchants").select("id, business_name, email, phone").eq("email", email).maybeSingle()
  );
}

export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  return safeMaybeSingle<Customer>(
    supabase.from("customers").select("id, full_name, email, phone").eq("email", email).maybeSingle()
  );
}


export async function listPublicUsersByRole(roles: string[], limit = 100): Promise<PublicUser[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, phone, role")
      .in("role", roles)
      .limit(limit);

    if (error) return [];
    return (data as any) ?? [];
  } catch {
    return [];
  }
}
