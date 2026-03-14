import React from "react";
import { extractPermissionList, hasPermission } from "./permissions";

export default function PermissionGuard({
  auth,
  require,
  fallback = null,
  children,
}: {
  auth: any;
  require?: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const owned = extractPermissionList(auth);
  if (!hasPermission(owned, require)) return <>{fallback}</>;
  return <>{children}</>;
}
