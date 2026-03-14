import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const nav = useNavigate();
  const { refresh } = useAuth();

  React.useEffect(() => {
    (async () => {
      await refresh();
      nav("/admin/dashboard", { replace: true });
    })();
  }, [nav, refresh]);

  return <div className="min-h-screen flex items-center justify-center text-xs">Completing sign-in…</div>;
}
