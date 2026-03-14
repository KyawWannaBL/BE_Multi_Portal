import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";

// The roles permitted to enter the Admin portal
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "SYS", "APP_OWNER", "ADM", "MGR"];

export default function AdminModuleWrapper() {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  // 1. While Supabase is checking the session, show a dark terminal loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05080F]">
        <Loader2 className="h-8 w-8 animate-spin text-[#059669]" />
      </div>
    );
  }

  // 2. If nobody is logged in, silently redirect them back to the terminal login screen
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // 3. STRICT SECURITY CHECK: If they are logged in, but are NOT an admin, block them
  const userRole = (role || "").toUpperCase();
  if (!ADMIN_ROLES.includes(userRole)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0F1C] text-slate-100 p-6">
        <div className="w-full max-w-md p-8 bg-[#0D121F] rounded-[2rem] border border-rose-900/50 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600"></div>
          
          <div className="w-16 h-16 mx-auto bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="h-8 w-8 text-rose-500" />
          </div>
          
          <h1 className="text-xl font-black text-rose-500 tracking-widest uppercase mb-2">
            Access Denied
          </h1>
          <p className="text-xs text-slate-400 font-mono leading-relaxed mb-8">
            Your current clearance level <span className="text-rose-400 font-bold">[{userRole || "UNKNOWN"}]</span> does not permit access to this secure sector.
          </p>
          
          <button 
            onClick={() => window.location.href = "/"}
            className="text-[10px] font-bold tracking-widest text-slate-500 hover:text-white uppercase transition-colors"
          >
            Return to Safety →
          </button>
        </div>
      </div>
    );
  }

  // 4. If they pass all checks, render the requested Admin page!
  return (
    <div className="admin-module-wrapper">
      <Outlet />
    </div>
  );
}