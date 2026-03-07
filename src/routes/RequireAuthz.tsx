import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { loadStore, getAccountByEmail, roleIsPrivileged } from "@/lib/accountControlStore";
import { NAV_SECTIONS, type NavItem } from "@/lib/portalRegistry";
import { hasAnyPermission } from "@/lib/permissionResolver";

export default function RequireAuthz() {
  const { user } = useAuth();
  const location = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      if (!user?.email) {
        setAuthorized(false);
        return;
      }
      
      const store = await loadStore();
      const account = getAccountByEmail(store, user.email);
      
      if (!account || account.status !== "ACTIVE") {
        setAuthorized(false);
        return;
      }

      // Allow privileged roles anywhere
      if (roleIsPrivileged(account.role)) {
        setAuthorized(true);
        return;
      }

      // Find the required permissions for the current route
      const allNavItems = NAV_SECTIONS.flatMap(section => section.items);
      const currentRoute = allNavItems.find(item => location.pathname.startsWith(item.href));

      if (currentRoute && currentRoute.requiredPermissions) {
        // Use the resolver to check if the role has the needed permissions
        const hasAccess = hasAnyPermission(account.role, currentRoute.requiredPermissions);
        setAuthorized(hasAccess);
      } else {
        // If no specific permissions are defined for the route, allow access
        setAuthorized(true);
      }
    }
    
    checkAuth();
  }, [user, location.pathname]);

  if (authorized === null) {
    return <div className="p-8 text-center text-gray-500">Checking authorization...</div>;
  }

  if (!authorized) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
