// @ts-nocheck
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (signUpError) throw signUpError;
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0B101B] border border-white/10 p-8 rounded-3xl text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Request Submitted</h1>
          <p className="text-slate-400 mb-8">Your account request has been submitted to platform administrators for approval.</p>
          <Link to="/login" className="inline-flex items-center justify-center h-12 px-6 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl uppercase tracking-widest transition-colors w-full">
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-4 text-slate-300">
      <div className="max-w-md w-full bg-[#0B101B] border border-white/10 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-2xl font-black text-white uppercase tracking-widest text-center mb-2">Request Access</h1>
        <p className="text-center text-slate-500 text-sm mb-8">Register for a new enterprise account</p>
        
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-slate-500 font-mono mb-2">Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-12 bg-[#05080F] border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-sky-500/50"
              required
            />
          </div>
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
              required minLength={6}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 mt-6 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-xl uppercase tracking-widest disabled:opacity-50 transition-colors"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account? <Link to="/login" className="text-sky-400 hover:text-sky-300 font-bold ml-1">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
