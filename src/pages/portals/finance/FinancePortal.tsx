import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
export default function PortalStub() {
  const { role } = useAuth();
  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center p-4">
      <div className="bg-[#111622] p-8 rounded-3xl border border-emerald-500/20 text-center">
        <h1 className="text-2xl font-black text-emerald-400 uppercase tracking-widest mb-2">Portal Module Active</h1>
        <p className="text-slate-400 text-sm">Your current role: <span className="text-white font-bold">{role}</span></p>
      </div>
    </div>
  );
}
