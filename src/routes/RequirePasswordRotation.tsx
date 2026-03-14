import * as React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function RequirePasswordRotation() {
  const { mustChangePassword, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-xs">Checking policy…</div>;
  if (mustChangePassword) return <Navigate to="/security-update" replace />;
  return <Outlet />;
}
