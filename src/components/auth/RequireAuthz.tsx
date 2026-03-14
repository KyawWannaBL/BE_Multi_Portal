import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

const MFA_REQUIRED_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A", "ADM", "MGR", "ADMIN"]);

const norm = (v?: string | null) => {
  const s = (v ?? "").trim().toUpperCase();
  return s === "SUPER_A" ? "SUPER_ADMIN" : s;
};

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
  const { bi } = useLanguage();
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

  if (loading) {
    return (
      <div className="p-6 text-sm font-mono text-emerald-500">
        {bi("INITIALIZING SECURITY...", "လုံခြုံရေး စတင်ပြင်ဆင်နေသည်...")}
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }

  const r = norm(role);
  if (MFA_REQUIRED_ROLES.has(r)) {
    if (aalOk === null) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#05080F] text-[#059669] font-mono text-xs tracking-widest text-center px-6">
          {bi("VERIFYING MULTI-FACTOR AUTHENTICATION...", "အချက်နှစ်ချက် အတည်ပြုခြင်း (MFA) စစ်ဆေးနေသည်...")}
        </div>
      );
    }

    if (!aalOk) {
      return <Navigate to="/login" replace state={{ from: loc.pathname, reason: "MFA_REQUIRED" }} />;
    }
  }

  return <>{children}</>;
}
