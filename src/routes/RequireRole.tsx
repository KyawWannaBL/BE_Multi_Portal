import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, SUPABASE_CONFIGURED } from "@/supabaseClient";

const norm = (v?: string | null) => {
  const s = (v ?? "").trim().toUpperCase();
  return s === "SUPER_A" ? "SUPER_ADMIN" : s;
};

const MFA_REQUIRED_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A", "ADM", "MGR", "ADMIN"]);

async function hasAal2(): Promise<boolean> {
  try {
    if (!supabase?.auth?.mfa?.getAuthenticatorAssuranceLevel) return false;
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return false;
    return data?.currentLevel === "aal2";
  } catch {
    return false;
  }
}

export function RequireRole({ allow = [], children }: { allow?: string[]; children: React.ReactNode }) {
  const { role, loading, isAuthenticated } = useAuth();
  const loc = useLocation();

  const [aalOk, setAalOk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      if (!isAuthenticated) return;
      const r = norm(role);
      if (!MFA_REQUIRED_ROLES.has(r)) {
        if (alive) setAalOk(true);
        return;
      }
      if (!SUPABASE_CONFIGURED) {
        if (alive) setAalOk(false);
        return;
      }
      const ok = await hasAal2();
      if (alive) setAalOk(ok);
    })();

    return () => {
      alive = false;
    };
  }, [isAuthenticated, role]);

  if (loading) return <div className="min-h-screen bg-[#05080F] flex items-center justify-center"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  const allowSet = new Set(allow.map(norm));
  const r = norm(role);

  if (!r || r === "GUEST") return <Navigate to="/unauthorized" replace state={{ reason: "ROLE_NOT_ASSIGNED" }} />;
  if (!allowSet.has(r)) return <Navigate to="/unauthorized" replace state={{ reason: "ROLE_NOT_ALLOWED", role: r }} />;

  if (MFA_REQUIRED_ROLES.has(r)) {
    if (aalOk === null) {
      return <div className="min-h-screen bg-[#05080F] flex items-center justify-center text-xs text-emerald-500 font-mono">Verifying MFA…</div>;
    }
    if (!aalOk) {
      return <Navigate to="/login" replace state={{ from: loc.pathname, reason: "MFA_REQUIRED" }} />;
    }
  }

  return <>{children}</>;
}
