// @ts-nocheck
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { defaultPortalForRole } from "@/lib/portalRegistry";

export default function DashboardRedirect() {
  const { role, loading } = useAuth() as any;
  if (loading) return null;
  if (!role) return <Navigate to="/login" replace />;
  return <Navigate to={defaultPortalForRole(role)} replace />;
}
