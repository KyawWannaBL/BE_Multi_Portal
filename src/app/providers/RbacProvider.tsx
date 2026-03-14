import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PermissionCode } from "@britium/shared";
import { getMyProfile } from "@/lib/profile";
import { supabase } from "@/lib/supabase";
import { getEffectivePermissions, normalizeRole } from "@/lib/rbac";

type RbacContextValue = {
  loading: boolean;
  userId: string | null;
  role: ReturnType<typeof normalizeRole>;
  permissions: PermissionCode[];
  mustChangePassword: boolean;
  refresh: () => Promise<void>;
};

const RbacContext = createContext<RbacContextValue | null>(null);

export function RbacProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<ReturnType<typeof normalizeRole>>(null);
  const [permissions, setPermissions] = useState<PermissionCode[]>([]);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const refresh = async () => {
    if (!supabase) {
      setUserId(null);
      setRole(null);
      setPermissions([]);
      setMustChangePassword(false);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { userId: uid, profile } = await getMyProfile();
    setUserId(uid);

    const rawRole = profile?.role ?? profile?.app_role ?? profile?.user_role ?? null;
    const normRole = normalizeRole(rawRole);
    setRole(normRole);

    setMustChangePassword(Boolean(profile?.must_change_password));

    setPermissions(getEffectivePermissions(normRole));
    setLoading(false);
  };

  useEffect(() => {
    refresh();

    if (!supabase) return;

    const { data } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => data.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<RbacContextValue>(
    () => ({ loading, userId, role, permissions, mustChangePassword, refresh }),
    [loading, userId, role, permissions, mustChangePassword]
  );

  return <RbacContext.Provider value={value}>{children}</RbacContext.Provider>;
}

export function useRbac() {
  const ctx = useContext(RbacContext);
  if (!ctx) throw new Error("useRbac must be used within RbacProvider");
  return ctx;
}
