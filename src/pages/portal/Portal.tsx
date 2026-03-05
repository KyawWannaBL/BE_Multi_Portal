import React from "react";
import { Navigate } from "react-router-dom";
import { useRbac } from "@/app/providers/RbacProvider";
import PortalHome from "@/pages/portal/PortalHome";

export default function Portal() {
  const { loading, profile } = useRbac();

  if (loading) return <div className="p-6 text-sm text-white/70">Loading…</div>;
  if (!profile) return <Navigate to="/login" replace />;

  const home = profile.home_path || "/portal";

  // If we can't determine a role home, show a generic portal home.
  if (home === "/portal") return <PortalHome />;

  return <Navigate to={home} replace />;
}
