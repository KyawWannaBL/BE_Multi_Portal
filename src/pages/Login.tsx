// @ts-nocheck
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Lucide from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export default function Login() {
  const nav = useNavigate();
  const langCtx = useLanguage() || { lang: "en" };
  const lang = useMemo(() => (langCtx.lang === "my" ? "my" : "en"), [langCtx]);
  const { login, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const LoaderIcon = Lucide.Loader2 || Lucide.RefreshCw || "span";
  const ArrowIcon = Lucide.ArrowRight || Lucide.ChevronRight || "span";
  const t = (en: string, mm: string) => (lang === "en" ? en : mm);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return;
    try {
      const { error: loginErr } = await login(email.trim(), password);
      if (loginErr) throw loginErr;
      nav("/dashboard");
    } catch (err: any) {
      setError(t("Access Denied: Invalid Credentials", "ဝင်ရောက်ခွင့်မရှိပါ: အချက်အလက်မှားယွင်းနေပါသည်"));
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#02040A]">
      {/* Luxury Cinematic Layer */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-20 scale-110 blur-[3px]">
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#02040A] via-transparent to-[#02040A] opacity-90" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="text-center mb-12 space-y-4">
          <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-white/[0.03] border border-white/10 p-6 backdrop-blur-3xl shadow-[0_0_80px_rgba(16,185,129,0.15)] ring-1 ring-white/10">
            <img src="/logo.png" alt="Enterprise Logo" className="h-full w-full object-contain filter drop-shadow-lg" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">System Access</h1>
            <p className="text-emerald-500/50 text-[10px] font-black uppercase tracking-[0.4em]">{t("Britium Core Infrastructure", "လုပ်ငန်းသုံး ပေါ်တယ်")}</p>
          </div>
        </div>

        {/* Luxury Glass Box */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-emerald-500/20 rounded-[3.5rem] blur-2xl opacity-40 group-hover:opacity-100 transition duration-1000" />
          
          <div className="relative bg-[#0A0E17]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 opacity-70" />
            
            <div className="p-10 space-y-10">
              {error && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl text-rose-400 text-[11px] text-center font-bold italic animate-pulse">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Luxury Field: Email */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">{t("Authorized Identity", "အီးမေးလ်")}</label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-white/[0.02] rounded-2xl transition-all group-focus-within/input:bg-white/[0.05] ring-1 ring-white/5 group-focus-within/input:ring-emerald-500/40" />
                    <Lucide.Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input 
                      type="email" 
                      placeholder="MD@BRITIUMEXPRESS.COM"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="relative w-full bg-transparent border-none rounded-2xl h-16 pl-14 pr-5 text-sm font-bold text-white placeholder:text-slate-800 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Luxury Field: Password */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-4">{t("Security Token", "စကားဝှက်")}</label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-white/[0.02] rounded-2xl transition-all group-focus-within/input:bg-white/[0.05] ring-1 ring-white/5 group-focus-within/input:ring-emerald-500/40" />
                    <Lucide.Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="relative w-full bg-transparent border-none rounded-2xl h-16 pl-14 pr-5 text-sm font-bold text-white placeholder:text-slate-800 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={authLoading} 
                  className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-[1.5rem] shadow-[0_15px_30px_rgba(16,185,129,0.25)] transition-all active:scale-[0.97] disabled:opacity-50"
                >
                  {authLoading ? (LoaderIcon !== "span" && <LoaderIcon className="animate-spin" />) : (
                    <span className="flex items-center justify-center gap-3">
                      {t("Initialize Session", "လုံခြုံစွာဝင်မည်")}
                      {ArrowIcon !== "span" && <ArrowIcon className="h-4 w-4" />}
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center pt-2">
                <button type="button" className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] hover:text-emerald-400 transition-colors">
                  {t("Access Request Required?", "ဝင်ရောက်ခွင့်တောင်းမည်")}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 text-[9px] text-slate-800 font-black uppercase tracking-[0.5em] opacity-40">
          Secure Terminal v4.0.3
        </div>
      </div>
    </div>
  );
}
