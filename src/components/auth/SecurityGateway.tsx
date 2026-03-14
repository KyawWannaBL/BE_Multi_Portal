import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function SecurityGateway() {
  const { user, legacyUser, loading } = useAuth() as any;
  const location = useLocation();

  if (loading) return <div className="min-h-screen bg-[#05080F] flex items-center justify-center text-amber-500 font-mono">Verifying Credentials...</div>;

  // 🛡️ God-Mode Extraction: Check every possible role field from your CSV
  const rawRole = legacyUser?.role || user?.role || user?.user_metadata?.role || user?.app_role || "GUEST";
  const role = String(rawRole).toUpperCase();
  
  const isAuthenticated = !!user || !!legacyUser;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚦 Intelligent Routing based on your CSV Roles
  const path = location.pathname;

  // Allow Super Admins to go ANYWHERE
  if (["SUPER_ADMIN", "SYS", "APP_OWNER"].includes(role)) return <Outlet />;

  // Role-Specific Gates
  if (path.includes('/portal/execution') && !role.includes('RIDER')) return <Navigate to="/unauthorized" />;
  if (path.includes('/portal/finance') && !role.includes('FINANCE')) return <Navigate to="/unauthorized" />;
  if (path.includes('/portal/warehouse') && !role.includes('HUB_MANAGER') && !role.includes('WAREHOUSE')) return <Navigate to="/unauthorized" />;
  if (path.includes('/portal/hr') && !role.includes('HR') && !role.includes('ADMIN')) return <Navigate to="/unauthorized" />;
  if (path.includes('/portal/merchant') && !role.includes('MERCHANT') && !role.includes('CUS')) return <Outlet />;

  return <Outlet />;
}
