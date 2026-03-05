import { Navigate } from "react-router-dom";
import type { PermissionCode } from "@britium/shared";
import { hasAll, hasAny } from "@/lib/rbac";
import { useRbac } from "@/app/providers/RbacProvider";

type Mode = "all" | "any";

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requirePasswordOk = true,
  requiredPermissions = [],
  permissionMode = "all",
}: {
  children: JSX.Element;
  requireAuth?: boolean;
  requirePasswordOk?: boolean;
  requiredPermissions?: PermissionCode[];
  permissionMode?: Mode;
}) {
  const { loading, userId, permissions, mustChangePassword } = useRbac();

  if (loading) return null;

  if (requireAuth && !userId) return <Navigate to="/login" replace />;

  if (requireAuth && requirePasswordOk && mustChangePassword) {
    return <Navigate to="/force-password-reset" replace />;
  }

  const allowed =
    permissionMode === "any"
      ? hasAny(permissions, requiredPermissions)
      : hasAll(permissions, requiredPermissions);

  if (requireAuth && requiredPermissions.length > 0 && !allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
