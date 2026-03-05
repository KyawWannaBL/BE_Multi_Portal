import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xs">Verifying session…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}
