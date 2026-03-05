import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getCurrentIdentity } from "@/lib/appIdentity";
import { getEffectivePermissions, normalizeRole } from "@/lib/rbac";

type AuthUser = { id: string; email?: string };

type AuthCtx = {
  user: AuthUser | null;
  role: string | null;
  permissions: string[];
  mustChangePassword: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

type ProfileRow = {
  id: string;
  role?: string | null;
  role_code?: string | null;
  app_role?: string | null;
  user_role?: string | null;
  must_change_password?: boolean | null;
  permissions?: string[] | null;
};

async function safeLoadProfile(userId: string): Promise<ProfileRow | null> {
  const trySelect = async (sel: string) =>
    supabase.from("profiles").select(sel).eq("id", userId).maybeSingle();

  // tolerate missing columns across environments
  let { data, error } = await trySelect("id, role, must_change_password, permissions, role_code, app_role, user_role");
  if (error && (error as any).code === "42703") {
    ({ data, error } = await trySelect("id, role, must_change_password"));
  }
  if (error && (error as any).code === "42P01") return null; // profiles table missing
  if (error) {
    console.warn("[AuthContext] loadProfile failed:", { code: (error as any).code, message: error.message });
    return null;
  }
  return (data as any) ?? null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const hydrate = async (session: any) => {
    if (!session?.user) {
      setUser(null);
      setRole(null);
      setPermissions([]);
      setMustChangePassword(false);
      setLoading(false);
      return;
    }

    const u = session.user as any;
    setUser({ id: u.id, email: u.email });

    const profile = await safeLoadProfile(u.id);
    const identity = await getCurrentIdentity();

    const rawRole =
      profile?.role ??
      profile?.app_role ??
      profile?.user_role ??
      profile?.role_code ??
      identity?.primary_role ??
      (u?.app_metadata?.role as string | undefined) ??
      (u?.user_metadata?.role as string | undefined) ??
      null;

    const norm = normalizeRole(rawRole);
    setRole(norm);

    setPermissions(getEffectivePermissions(norm));

    const must =
      Boolean(profile?.must_change_password) ||
      Boolean((u?.user_metadata as any)?.must_change_password) ||
      Boolean((u?.app_metadata as any)?.must_change_password);
    setMustChangePassword(must);

    setLoading(false);
  };

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    await hydrate(data?.session);
  };

  useEffect(() => {
    void refresh();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrate(session);
    });
    return () => data?.subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.session) {
      setLoading(false);
      return { success: false, message: "Invalid credentials." };
    }
    await hydrate(data.session);
    return { success: true, message: "OK" };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    await refresh();
  };

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      role,
      permissions,
      mustChangePassword,
      isAuthenticated: !!user,
      loading,
      login,
      logout,
      refresh,
    }),
    [user, role, permissions, mustChangePassword, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
