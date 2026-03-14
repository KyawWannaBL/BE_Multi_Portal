import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function RequireRole({
  allow = [],
  children,
}: {
  allow?: string[];
  children: React.ReactNode;
}) {
  const { role, loading, isAuthenticated } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="p-6 text-sm">Loading…</div>;
  if (!allow.length) return <>{children}</>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  const ok = !!role && allow.includes(role);
  if (!ok) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
