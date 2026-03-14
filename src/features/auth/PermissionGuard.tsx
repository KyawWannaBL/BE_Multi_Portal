import { Navigate, useLocation } from "react-router-dom";
import { usePermissions } from "./usePermissions";

export function PermissionGuard({
  permission,
  children,
}: {
  permission?: string | string[];
  children: React.ReactNode;
}) {
  const { has } = usePermissions();
  const location = useLocation();

  try {
    if (!has(permission)) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{ from: location.pathname }}
        />
      );
    }
  } catch {
    return <>{children}</>;
  }

  return <>{children}</>;
}