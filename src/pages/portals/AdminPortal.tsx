import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PortalShell } from "@/components/layout/PortalShell";

export default function AdminPortal() {
  const { role } = useAuth();

  // Keep legacy /admin layout as the deep admin UI
  if (role === "SYS" || role === "APP_OWNER" || role === "SUPER_ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <PortalShell title="Admin Portal">
      <div className="text-sm opacity-80">You are authenticated but not an admin.</div>
    </PortalShell>
  );
}
