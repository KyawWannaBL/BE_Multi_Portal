import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Visual Identity & Icon */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-rose-500 blur-2xl opacity-20 animate-pulse"></div>
          <div className="relative bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl">
            <ShieldAlert size={64} className="text-rose-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-slate-900 p-2 rounded-full border border-slate-700">
            <Lock size={20} className="text-slate-400" />
          </div>
        </div>

        {/* Messaging */}
        <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">
          Access Denied
        </h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Your account does not have the required permissions to view this module. 
          If you believe this is an error, please contact your <span className="text-emerald-400 font-semibold">Britium System Administrator</span>.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold border border-slate-700 transition-all shadow-lg"
          >
            <ArrowLeft size={18} /> GO BACK
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20"
          >
            <Home size={18} /> RETURN TO DASHBOARD
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-slate-800/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
            Britium Express • Security Subsystem 403
          </p>
        </div>
      </div>
    </div>
  );
}