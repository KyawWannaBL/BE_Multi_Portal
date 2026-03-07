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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020408]">
      {/* Luxury Background Overlay */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover opacity-15 scale-110 blur-[4px]">
          <source src="/background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#020408] via-transparent to-[#020408] opacity-95" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="text-center mb-10 space-y-5">
          <div className="mx-auto h-24 w-24 rounded-[2.5rem] bg-white/[0.02] border border-white/10 p-6 backdrop-blur-3xl shadow-[0_0_100px_rgba(16,185,129,0.1)] ring-1 ring-white/5">
            <img src="/logo.png" alt="Enterprise Logo" className="h-full w-full object-contain filter brightness-110 drop-shadow-2xl" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter drop-shadow-2xl">Terminal Login</h1>
            <p className="text-emerald-500/40 text-[9px] font-black uppercase tracking-[0.5em]">{t("Britium Secure Core", "လုပ်ငန်းသုံး ပေါ်တယ်")}</p>
          </div>
        </div>

        {/* Luxury Input Container */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10 rounded-[3.5rem] blur-2xl opacity-50 transition duration-1000 group-hover:opacity-100" />
          
          <div className="relative bg-[#0A0D15]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-cyan-500 opacity-60" />
            
            <div className="p-10 space-y-10">
              {error && (
                <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-rose-400 text-[10px] text-center font-bold tracking-widest italic animate-pulse uppercase">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-7">
                {/* Identity Field */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-4">{t("Authorized ID", "အီးမေးလ်")}</label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-white/[0.01] rounded-2xl transition-all group-focus-within/input:bg-white/[0.04] ring-1 ring-white/5 group-focus-within/input:ring-emerald-500/30" />
                    <Lucide.Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input 
                      type="email" 
                      placeholder="identity@britium.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="relative w-full bg-transparent border-none rounded-2xl h-16 pl-14 pr-6 text-sm font-bold text-white placeholder:text-slate-800 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Token Field */}
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 ml-4">{t("Access Token", "စကားဝှက်")}</label>
                  <div className="relative group/input">
                    <div className="absolute inset-0 bg-white/[0.01] rounded-2xl transition-all group-focus-within/input:bg-white/[0.04] ring-1 ring-white/5 group-focus-within/input:ring-emerald-500/30" />
                    <Lucide.Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600 transition-colors group-focus-within/input:text-emerald-500" />
                    <input 
                      type="password" 
                      placeholder="••••••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="relative w-full bg-transparent border-none rounded-2xl h-16 pl-14 pr-6 text-sm font-bold text-white placeholder:text-slate-800 outline-none transition-all shadow-inner"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={authLoading} 
                  className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-[0.2em] uppercase rounded-[1.5rem] shadow-[0_20px_40px_rgba(16,185,129,0.2)] transition-all active:scale-[0.96] disabled:opacity-40"
                >
                  {authLoading ? (LoaderIcon !== "span" && <LoaderIcon className="animate-spin" />) : (
                    <span className="flex items-center justify-center gap-4">
                      {t("Verify Identity", "စစ်ဆေးမည်")}
                      {ArrowIcon !== "span" && <ArrowIcon className="h-4 w-4" />}
                    </span>
                  )}
                </Button>
              </form>

              <div className="text-center pt-2">
                <button type="button" className="text-[9px] text-slate-700 font-black uppercase tracking-[0.4em] hover:text-emerald-400 transition-colors opacity-50 hover:opacity-100">
                  {t("Issue credentials?", "ဝင်ရောက်ခွင့်တောင်းမည်")}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12 text-[8px] text-slate-800 font-black uppercase tracking-[0.6em] opacity-30">
          Core Security v4.5.12-PRO
        </div>
      </div>
    </div>
  );
}
