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
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Download, Globe, Loader2, Lock, Mail, RefreshCw, ShieldCheck, UserPlus } from "lucide-react";

type View = "password" | "magic" | "otp_verify" | "forgot" | "request" | "force_change" | "mfa_enroll" | "mfa_verify";

export default function Login() {
  const navigate = useNavigate();
  const { lang, toggleLang } = useLanguage();
  const { login } = useAuth();
  const [isBooting, setIsBooting] = useState(true);
  const [bootLog, setBootLog] = useState("Initializing BRITIUM Gateway...");
  const [view, setView] = useState<View>("password");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(getRememberMe());
  const [errorMsg, setErrorMsg] = useState("");

  const t = (en: string, my: string) => lang === "en" ? en : my;

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) navigate("/portal/operations", { replace: true });
      setTimeout(() => setIsBooting(false), 1500);
    };
    run();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRememberMe(remember);
    const { error } = await login(email, password);
    if (error) setErrorMsg(error.message);
    else navigate("/portal/operations");
    setLoading(false);
  };

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#05080F] flex items-center justify-center p-4">
        <div className="bg-white rounded-[24px] p-8 w-full max-w-md shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center">
              <img src="/logo.png" className="w-12 h-12" alt="Logo" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-black text-slate-900 uppercase">Britium</h2>
              <p className="text-xs text-slate-500 italic">{t("Securing Gateway...", "စနစ်စစ်ဆေးနေသည်...")}</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="text-[10px] font-black text-slate-500 uppercase">Status</div>
            <div className="text-sm font-bold text-slate-800 mt-1">{bootLog}</div>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" />
              <span className="text-xs font-black text-emerald-600">System Online</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080F] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
            <img src="/logo.png" className="h-16 w-16 object-contain" alt="Britium" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Enterprise Portal</h1>
        </div>

        <Card className="bg-[#111622] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-3xl">
          <CardContent className="p-8 space-y-6">
            {errorMsg && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs font-bold">{errorMsg}</div>}
            <form onSubmit={handleLogin} className="space-y-4">
              <Input type="email" placeholder="Corporate Email" value={email} onChange={e => setEmail(e.target.value)} required className="h-14 bg-black/40 rounded-2xl text-white pl-4" />
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="h-14 bg-black/40 rounded-2xl text-white pl-4" />
              <div className="flex justify-between items-center text-[11px] font-black">
                <label className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="accent-emerald-500" /> Remember Me
                </label>
                <button type="button" onClick={() => navigate("/signup")} className="text-emerald-400">Sign Up</button>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 rounded-2xl font-black uppercase shadow-xl">
                {loading ? <Loader2 className="animate-spin" /> : <>Authenticate <ArrowRight className="ml-2 h-5 w-5" /></>}
              </Button>
            </form>
            <Separator className="bg-white/5" />
            <a href="/android.apk" download className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl border border-white/10 bg-white/5 text-white font-black uppercase text-[11px] hover:bg-white/10 transition-all">
              <Download className="h-4 w-4" /> Download Android APK
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
