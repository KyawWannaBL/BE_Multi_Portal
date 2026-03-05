import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

interface PermissionGateProps {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode; // Optional: Render this if permission is missing (e.g., a lock icon or null)
}

export default function PermissionGate({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission } = useAuth();

  // "hasPermission" automatically handles the 'APP_OWNER' override 
  // defined in your useAuth hook.
  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}