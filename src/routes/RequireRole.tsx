import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const norm = (v?: string | null) => {
  const s = (v ?? "").trim().toUpperCase();
  return s === "SUPER_A" ? "SUPER_ADMIN" : s;
};

export function RequireRole({ allow = [], children }: { allow?: string[]; children: React.ReactNode }) {
  const { role, loading, isAuthenticated } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="p-6 text-sm">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  const r = norm(role);
  const allowSet = new Set(allow.map(norm));

  if (!r) return <Navigate to="/unauthorized" replace state={{ reason: "ROLE_NOT_ASSIGNED" }} />;
  if (!allowSet.has(r)) return <Navigate to="/unauthorized" replace state={{ reason: "ROLE_NOT_ALLOWED", role: r }} />;

  return <>{children}</>;
}
