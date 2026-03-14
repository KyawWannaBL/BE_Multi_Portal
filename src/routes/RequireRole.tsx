import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeRole } from "@/lib/portalRegistry";
export function RequireRole({ children, allow }: { children: React.ReactNode; allow: string[] }) {
  const { role, loading } = useAuth();
  if (loading) return null;
  const r = normalizeRole(role);
  if (!allow.includes(r) && !["SYS", "APP_OWNER", "SUPER_ADMIN"].includes(r)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
