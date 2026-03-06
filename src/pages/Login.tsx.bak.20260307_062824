// @ts-nocheck
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { defaultPortalForRole } from "@/lib/portalRegistry";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth() as any;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: loginError } = await login(email, password);
      if (loginError) throw loginError;
      
      const role = data?.user?.user_metadata?.role || "GUEST";
      navigate(defaultPortalForRole(role));
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-4 text-slate-300">
      <div className="max-w-md w-full bg-[#0B101B] border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-sky-500/10 text-sky-500 rounded-full flex items-center justify-center shadow-inner">
            <ShieldCheck size={32} />
          </div>
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-widest text-center mb-2">System Login</h1>
        <p className="text-center text-slate-500 text-sm mb-8">Authenticate to access the enterprise portal</p>
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-slate-500 font-mono mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-12 bg-[#05080F] border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-sky-500/50"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-slate-500 font-mono mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-12 bg-[#05080F] border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-sky-500/50"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 mt-6 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl uppercase tracking-widest disabled:opacity-50 transition-colors"
          >
            {loading ? "Authenticating..." : "Secure Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Need an account? <Link to="/signup" className="text-sky-400 hover:text-sky-300 font-bold ml-1">Request Access</Link>
        </div>
      </div>
    </div>
  );
}
