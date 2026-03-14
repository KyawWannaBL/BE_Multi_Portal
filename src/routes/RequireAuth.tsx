import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";

// Roles that are strictly required to have MFA (AAL2) enabled
const MFA_REQUIRED_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A", "ADM", "MGR", "ADMIN"]);

/**
 * Normalizes role strings to ensure consistent matching
 */
const norm = (v?: string | null) => {
  const s = (v ?? "").trim().toUpperCase();
  return s === "SUPER_A" ? "SUPER_ADMIN" : s;
};

/**
 * Checks if the current session has reached Authenticator Assurance Level 2 (MFA)
 */
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

export function RequireAuthz({ children }: { children: React.ReactNode }) {
  const { role, loading, isAuthenticated } = useAuth();
  const loc = useLocation();
  const [aalOk, setAalOk] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    let alive = true;

    (async () => {
      if (!isAuthenticated) return;
      
      const r = norm(role);
      
      // If the role doesn't require MFA, mark as OK immediately
      if (!MFA_REQUIRED_ROLES.has(r)) {
        if (alive) setAalOk(true);
        return;
      }

      // If Supabase environment is missing, we cannot verify MFA
      if (!SUPABASE_CONFIGURED) {
        if (alive) setAalOk(false);
        return;
      }

      // Verify if the admin has completed the MFA challenge
      const ok = await hasAal2();
      if (alive) setAalOk(ok);
    })();

    return () => { alive = false; };
  }, [isAuthenticated, role]);

  // Loading States
  if (loading) return <div className="p-6 text-sm font-mono text-emerald-500">INITIALIZING SECURITY...</div>;
  
  // 1. Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  // 2. MFA Enforcement Logic
  const r = norm(role);
  if (MFA_REQUIRED_ROLES.has(r)) {
    if (aalOk === null) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#05080F] text-[#059669] font-mono text-xs tracking-widest">
          VERIFYING MULTI-FACTOR AUTHENTICATION...
        </div>
      );
    }
    
    // If MFA check failed, send them back to login to complete the MFA challenge
    if (!aalOk) {
      return <Navigate to="/login" replace state={{ from: loc.pathname, reason: "MFA_REQUIRED" }} />;
    }
  }

  return <>{children}</>;
}