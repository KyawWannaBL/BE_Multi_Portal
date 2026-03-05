import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { getCurrentIdentity } from "@/lib/appIdentity";
import { portalPathForRole } from "@/lib/portalRouting";

export default function DashboardRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    async function routeUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate("/login", { replace: true });

      const identity = await getCurrentIdentity();
      const role =
        identity?.primary_role ||
        (session.user.app_metadata as any)?.role ||
        (session.user.user_metadata as any)?.role ||
        null;

      navigate(portalPathForRole(role), { replace: true });
    }

    void routeUser();
  }, [navigate]);

  return (
    <div className="h-screen bg-[#0B101B] flex items-center justify-center">
      <div className="text-emerald-500 font-black animate-pulse uppercase tracking-[0.2em]">
        Opening Britium Portal...
      </div>
    </div>
  );
}
