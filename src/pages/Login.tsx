import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, 
  ArrowRight, 
  Globe, 
  Loader2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff,
  ShieldCheck 
} from "lucide-react";

type View = "login" | "mfa" | "forgot" | "force_change";

const MFA_REQUIRED_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A", "ADM", "MGR", "ADMIN"]);

async function loadProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, must_change_password")
      .eq("id", userId)
      .maybeSingle();
    if (error) return { role: "GUEST", mustChange: false };
    return { 
      role: (data?.role || "GUEST").toUpperCase(), 
      mustChange: !!data?.must_change_password 
    };
  } catch { return { role: "GUEST", mustChange: false }; }
}

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const { refresh } = useAuth();
  const { lang, toggleLang } = useLanguage();
  
  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      await refresh();
      const prof = await loadProfile(data.user.id);
      
      if (prof.mustChange) { setView("force_change"); return; }
      if (MFA_REQUIRED_ROLES.has(prof.role)) { setView("mfa"); return; }
      
      nav("/portal/operations", { replace: true });
    } catch (err: any) {
      setErrorMsg(`ACCESS DENIED: ${err.message.toUpperCase()}`); 
    } finally { setLoading(false); }
  };

  const handleMfaVerify = async () => {
    setLoading(true);
    try {
      // In a real flow, you'd fetch the factorId/challengeId from supabase.auth.mfa.listFactors()
      setErrorMsg("MFA Verification sequence initiated...");
      // Logic would continue to Supabase MFA verification here
    } catch (err: any) {
      setErrorMsg(`MFA ERROR: ${err.message.toUpperCase()}`);
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0A0F1C] text-slate-100 font-sans overflow-hidden">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none grayscale">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="relative z-10 w-full max-w-[420px] p-6 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* ENLARGED LOGO SECTION */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-32 h-32 rounded-[2.5rem] bg-[#0E1525] border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)] flex items-center justify-center relative overflow-hidden">
             <img src="/logo.png" alt="Britium" className="h-20 w-20 object-contain z-10 filter drop-shadow-2xl" />
             <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-md">
              {view === "mfa" ? "Security Gateway" : "Terminal Login"}
            </h1>
            <p className="text-[10px] font-bold tracking-[0.4em] text-emerald-500 uppercase opacity-70">Britium Secure Core</p>
          </div>
        </div>

        <div className="bg-[#0D121F]/90 backdrop-blur-2xl rounded-[3rem] border border-white/5 shadow-2xl p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-emerald-400 to-cyan-500 opacity-60" />
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[10px] font-bold tracking-widest text-center uppercase italic animate-pulse">
              {errorMsg}
            </div>
          )}

          {view === "login" ? (
            <form onSubmit={handleLogin} className="space-y-7">
              <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-widest text-white/30 uppercase ml-2">{t("Authorized ID", "အိုင်ဒီ")}</label>
                <div className="relative flex items-center group/input">
                  <Mail className="absolute left-6 w-4 h-4 text-white/20 group-focus-within/input:text-emerald-500 transition-colors" />
                  <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                    className="w-full bg-[#05070A] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/10" 
                    placeholder="identity@britium.com" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold tracking-widest text-white/30 uppercase ml-2">{t("Access Token", "စကားဝှက်")}</label>
                <div className="relative flex items-center group/input">
                  <Lock className="absolute left-6 w-4 h-4 text-white/20 group-focus-within/input:text-emerald-500 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} onChange={(e) => setPassword(e.target.value)} required 
                    className="w-full bg-[#05070A] border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-sm text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-white/10" 
                    placeholder="••••••••" 
                  />
                  {/* EYELASH TOGGLE */}
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 text-white/20 hover:text-emerald-500 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-[#05070A] font-black text-xs tracking-widest uppercase rounded-2xl py-6 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(16,185,129,0.2)] active:scale-95">
                {loading ? <Loader2 className="animate-spin" /> : t("Verify Identity", "အတည်ပြုမည်")}
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* MFA / MULTI-STEP NAVIGATION VIEW */
            <div className="space-y-8 py-4">
               <div className="space-y-6 text-center">
                 <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto opacity-50" />
                 <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">
                   {t("Verification Required", "အဆင့်မြင့်အတည်ပြုရန်လိုအပ်သည်")}
                 </p>
                 <input 
                   type="text" value={otp} onChange={(e) => setOtp(e.target.value)} 
                   className="w-full bg-[#05070A] border border-emerald-500/30 rounded-2xl py-5 text-center text-white tracking-[0.5em] font-mono text-xl outline-none focus:border-emerald-500" 
                   placeholder="000000" 
                 />
               </div>

               {/* NEXT / PREVIOUS NAVIGATION */}
               <div className="flex gap-4">
                 <button onClick={() => setView("login")} className="flex-1 bg-white/5 border border-white/10 text-white/40 font-bold text-[10px] tracking-widest uppercase rounded-xl py-5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                   <ArrowLeft size={14} /> Previous
                 </button>
                 <button onClick={handleMfaVerify} className="flex-1 bg-emerald-600 text-[#05070A] font-bold text-[10px] tracking-widest uppercase rounded-xl py-5 flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all">
                   Next <ArrowRight size={14} />
                 </button>
               </div>
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-white/5 flex justify-between items-center px-2">
            <button onClick={() => setView("forgot")} className="text-[10px] font-black tracking-widest text-white/20 hover:text-emerald-400 transition-colors uppercase">
              {t("Forgot Password?", "စကားဝှက်မေ့နေသလား?")}
            </button>
            <button onClick={toggleLang} className="flex items-center gap-2 text-[10px] font-black tracking-widest text-white/20 hover:text-white transition-colors uppercase">
              <Globe size={14} /> {lang === 'en' ? 'MY' : 'EN'}
            </button>
          </div>
        </div>

        <div className="text-center text-[8px] text-white/10 font-black uppercase tracking-[0.8em]">
          Core Security v4.8.5-PRO
        </div>
      </div>
    </div>
  );
}
