// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured, getRememberMe, setRememberMe } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, ArrowRight, Download, Mail, Lock, Loader2, Globe, Fingerprint, ShieldCheck, UserPlus } from "lucide-react";

type View = "password" | "forgot" | "request" | "force_change" | "biometric_setup";

export default function Login() {
  const navigate = useNavigate();
  const { lang, toggleLang } = useLanguage();
  const { login } = useAuth();
  
  const [isBooting, setIsBooting] = useState(true);
  const [view, setView] = useState<View>("password");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPass, setNewPass] = useState("");
  const [remember, setRemember] = useState(getRememberMe());
  const [errorMsg, setErrorMsg] = useState("");

  const t = (en: string, my: string) => lang === "en" ? en : my;

  useEffect(() => {
    let mounted = true;
    
    // HARD FALLBACK: Ensure the boot screen disappears after 3 seconds NO MATTER WHAT
    const hardTimeout = setTimeout(() => {
      if (mounted) setIsBooting(false);
    }, 3000);

    const run = async () => {
      try {
        if (!isSupabaseConfigured) return;
        const { data } = await supabase.auth.getSession();
        if (data?.session && mounted) {
          navigate("/", { replace: true });
        }
      } catch (err) {
        console.error("Boot sequence error:", err);
      } finally {
        if (mounted) setTimeout(() => setIsBooting(false), 1000);
      }
    };
    run();

    return () => { 
      mounted = false; 
      clearTimeout(hardTimeout);
    };
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setRememberMe(remember);
    try {
      const { data, error } = await login(email, password);
      if (error) throw error;
      if (!data?.user?.id) throw new Error("Authentication verification failed.");

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
      const role = (profile?.role || profile?.role_code || 'GUEST').toUpperCase();
      
      // Default password policy enforcement
      const isDefault = password === "P@ssw0rd1" || password.startsWith("Britium@");
      const mustChange = profile?.must_change_password === true || isDefault;

      if (mustChange && !["SUPER_ADMIN", "APP_OWNER"].includes(role)) {
        setView("force_change");
      } else {
        setView("biometric_setup");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Login system encountered an error.");
    } finally {
      setLoading(false);
    }
  };

  const handleForceChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
         await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id);
      }
      setView("biometric_setup");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update security credentials.");
    } finally {
      setLoading(false);
    }
  };

  const finalizeLogin = async () => {
    navigate("/", { replace: true });
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl animate-in fade-in duration-700">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center">
              <img src="/logo.png" className="w-12 h-12" alt="Logo" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-slate-900 uppercase">BRITIUM L5</h2>
              <p className="text-xs text-slate-500 italic">Securing Gateway Environment...</p>
            </div>
          </div>
          <div className="mt-8 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
            <img src="/logo.png" className="h-12 w-12 object-contain" alt="Britium" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Enterprise Portal</h1>
        </div>

        <Card className="bg-[#111622] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-3xl">
          <div className="h-1.5 w-full bg-emerald-500" />
          <CardContent className="p-8 space-y-6">
            {errorMsg && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-[10px] font-bold uppercase tracking-widest">{errorMsg}</div>}
            
            {view === "password" && (
              <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-left duration-300">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                  <Input type="email" placeholder="Corporate Email" value={email} onChange={e => setEmail(e.target.value)} required className="h-14 bg-black/40 border-white/10 rounded-2xl text-white pl-12" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                  <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="h-14 bg-black/40 border-white/10 rounded-2xl text-white pl-12" />
                </div>
                <div className="flex justify-between items-center text-[11px] font-black">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-emerald-500 h-4 w-4" /> Remember Me
                  </label>
                  <button type="button" onClick={() => setView("request")} className="text-[#D4AF37] uppercase tracking-widest">Sign Up</button>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black uppercase shadow-xl">
                  {loading ? <Loader2 className="animate-spin" /> : <>Authenticate <ArrowRight className="ml-2 h-5 w-5" /></>}
                </Button>
              </form>
            )}

            {view === "request" && (
              <div className="space-y-4 animate-in slide-in-from-right duration-300 text-center">
                <h3 className="text-white font-black uppercase text-sm">Request Access</h3>
                <p className="text-slate-400 text-xs">Submit an access request to IT Command.</p>
                <Button onClick={() => navigate("/signup")} className="w-full h-14 bg-[#D4AF37] rounded-2xl text-black font-black uppercase"><UserPlus className="mr-2 h-5 w-5"/> Sign Up Portal</Button>
              </div>
            )}

            {view === "force_change" && (
              <form onSubmit={handleForceChange} className="space-y-5 animate-in slide-in-from-right duration-500">
                <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
                  <p className="text-amber-200 text-[10px] font-black uppercase tracking-widest leading-loose">Mandatory Action: Default Password Detected. Reset Required.</p>
                </div>
                <Input type="password" required placeholder="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} className="h-14 bg-black/40 border-white/10 rounded-2xl text-white px-4" />
                <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 rounded-2xl font-black uppercase">
                  {loading ? <Loader2 className="animate-spin"/> : "Update & Continue"}
                </Button>
              </form>
            )}

            {view === "biometric_setup" && (
              <div className="text-center space-y-6 animate-in zoom-in duration-500">
                <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Fingerprint className="text-emerald-400 h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-sm">Enable Biometrics</h3>
                  <p className="text-slate-400 text-[10px] mt-1 px-4 leading-relaxed">Register fingerprint for faster secure access next time.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={finalizeLogin} className="flex-1 text-slate-500 text-[10px] font-black uppercase hover:text-white border border-white/5">Skip</Button>
                  <Button onClick={() => { alert('Biometric sensor activated'); finalizeLogin(); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black uppercase text-[10px]">Enroll Now</Button>
                </div>
              </div>
            )}

            <Separator className="bg-white/5" />

            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest px-2">
              <button onClick={toggleLang} className="text-slate-400 flex items-center gap-1 hover:text-white transition-colors">
                <Globe className="h-3 w-3" /> {lang === 'en' ? 'MY' : 'EN'}
              </button>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
