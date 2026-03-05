import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  allowedRoles?: string[];
  children: React.ReactNode;
};

export default function RoleBasedRoute({ allowedRoles = [], children }: Props) {
  const { user, role, loading, mustChangePassword } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (mustChangePassword && location.pathname !== "/force-password-reset") {
    return <Navigate to="/force-password-reset" replace />;
  }

  if (role === "APP_OWNER") return <>{children}</>;

  if (allowedRoles.length === 0) return <>{children}</>;

  if (!role || !allowedRoles.includes(String(role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
