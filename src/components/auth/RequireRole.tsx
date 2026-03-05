import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import type { AppRole } from "@/types/roles";
import { useAuth } from "@/contexts/AuthContext";

export function RequireRole({
  allow = [],
  children,
}: {
  allow?: AppRole[];
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading...</div>;

  // If you want public access, pass allow={[]} OR don't wrap route
  if (!allow.length) return <>{children}</>;

  // Require login for protected panels
  if (!user && !role) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  const ok = !!role && allow.includes(role);
  if (!ok) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}
