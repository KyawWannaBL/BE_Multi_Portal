import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Unauthorized() {
  const loc = useLocation();
  const reason = loc.state?.reason || 'Access Denied';
  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-3xl font-black text-rose-500 mb-2 tracking-widest uppercase">UNAUTHORIZED</h1>
      <p className="text-slate-400 mb-6 uppercase tracking-widest text-xs font-mono">{reason}</p>
      <Link to="/login" className="text-emerald-400 hover:text-emerald-300 uppercase font-bold text-sm tracking-widest">
        Return to Login
      </Link>
    </div>
  );
}
