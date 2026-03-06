// @ts-nocheck
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  const loc = useLocation();
  const state = loc.state as any;

  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0B101B] border border-white/10 p-8 rounded-3xl text-center">
        <div className="mx-auto w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={32} />
        </div>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-widest mb-2">Access Denied</h1>
        <p className="text-slate-400 text-sm mb-6">
          {state?.detail || "You don't have permission to access this area."}
        </p>
        <Link to="/" className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase text-xs tracking-widest transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
