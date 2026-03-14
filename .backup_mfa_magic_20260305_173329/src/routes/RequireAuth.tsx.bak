import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/supabaseClient";

const ADMIN_MFA_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "ADMIN", "ADM", "MGR"]);

export function RequireAuth() {
  const { isAuthenticated, loading, role } = useAuth();
  const loc = useLocation();

  const [mfaChecked, setMfaChecked] = React.useState(false);
  const [mfaOk, setMfaOk] = React.useState(true);

  React.useEffect(() => {
    let alive = true;

    async function check() {
      if (!isAuthenticated) {
        if (alive) {
          setMfaOk(true);
          setMfaChecked(true);
        }
        return;
      }

      const r = (role ?? "").trim().toUpperCase();
      if (!ADMIN_MFA_ROLES.has(r)) {
        if (alive) {
          setMfaOk(true);
          setMfaChecked(true);
        }
        return;
      }

      try {
        const mfa = supabase?.auth?.mfa;
        if (!isSupabaseConfigured || !mfa || typeof mfa.getAuthenticatorAssuranceLevel !== "function") {
          if (alive) {
            setMfaOk(false);
            setMfaChecked(true);
          }
          return;
        }

        const { data, error } = await mfa.getAuthenticatorAssuranceLevel();
        if (!alive) return;

        if (error) {
          setMfaOk(false);
          setMfaChecked(true);
          return;
        }

        setMfaOk(data?.currentLevel === "aal2");
        setMfaChecked(true);
      } catch {
        if (alive) {
          setMfaOk(false);
          setMfaChecked(true);
        }
      }
    }

    setMfaChecked(false);
    void check();

    return () => {
      alive = false;
    };
  }, [isAuthenticated, role]);

  if (loading || !mfaChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-300 bg-[#05080F]">
        Verifying session…
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  if (!mfaOk) {
    return <Navigate to="/login" replace state={{ from: loc.pathname, reason: "MFA_REQUIRED" }} />;
  }

  return <Outlet />;
}
