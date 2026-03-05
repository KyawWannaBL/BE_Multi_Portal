// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Copy, Globe, Loader2, Lock, Mail, RefreshCw, ShieldCheck, UserPlus } from "lucide-react";

const OPS_ROLES = new Set([ "OPERATIONS_ADMIN", "STAFF", "DATA_ENTRY", "SUPERVISOR", "WAREHOUSE_MANAGER", "SUBSTATION_MANAGER", "BRANCH_MANAGER", "ADM", "MGR", "SUPER_ADMIN", "SYS", "APP_OWNER" ]);
const EXEC_ROLES = new Set(["RIDER", "DRIVER", "HELPER"]);
const FIN_ROLES = new Set(["FINANCE", "FINANCE_ADMIN", "ACCOUNTANT"]);

function normalizeRole(role?: string) {
  const r = (role ?? "").trim().toUpperCase();
  if (!r) return "GUEST";
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r;
}

function pathForRole(role?: string) {
  const r = normalizeRole(role);
  if (FIN_ROLES.has(r)) return "/portal/finance";
  if (OPS_ROLES.has(r)) return "/portal/operations";
  if (EXEC_ROLES.has(r)) return "/portal/execution";
  return "/portal/operations";
}

function supabaseReady() {
  try {
    return Boolean(supabase && supabase.auth && typeof supabase.auth.getSession === "function");
  } catch {
    return false;
  }
}

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth?.();
  const langCtx = useLanguage?.() ?? {};
  const lang = langCtx.lang || "en";
  const setLanguage = langCtx.setLanguage;
  const toggleLang = langCtx.toggleLang;

  const [currentLang, setCurrentLang] = useState(lang || "en");
  const t = (en: string, my: string) => (currentLang === "en" ? en : my);

  const [view, setView] = useState("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [configMissing, setConfigMissing] = useState(false);

  useEffect(() => {
    if (lang) setCurrentLang(lang);
  }, [lang]);

  const onToggleLanguage = () => {
    const next = currentLang === "en" ? "my" : "en";
    setCurrentLang(next);
    if (typeof setLanguage === "function") setLanguage(next);
    else if (typeof toggleLang === "function") toggleLang();
  };

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  useEffect(() => {
    (async () => {
      const ok = supabaseReady();
      setConfigMissing(!ok);
      if (!ok) return;

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) return;
        if (data?.session?.user?.id) {
          const { data: profile } = await supabase.from("profiles").select("role, requires_password_change").eq("id", data.session.user.id).single();
          if (profile?.requires_password_change) {
            setView("force_change");
            return;
          }
          navigate(pathForRole(profile?.role), { replace: true });
        }
      } catch { }
    })();
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (configMissing) return setErrorMsg(t("System configuration is missing.", "System config မပြည့်စုံပါ။"));

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const { data: profile } = await supabase.from("profiles").select("role, requires_password_change").eq("id", data.user.id).single();
      
      if (profile?.requires_password_change) {
        setView("force_change");
        setSuccessMsg(t("Password update required.", "စကားဝှက် ပြောင်းရန် လိုအပ်ပါသည်။"));
        return;
      }
      navigate(pathForRole(profile?.role), { replace: true });
    } catch (err: any) {
      setErrorMsg(t("Access Denied: Invalid credentials.", "ဝင်ရောက်ခွင့် ငြင်းပယ်ခံရသည်: အချက်အလက်မှားနေသည်။"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05080F] text-slate-100 p-4">
      {/* Background Video */}
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 z-20">
        <Button onClick={onToggleLanguage} variant="outline" className="bg-black/40 border-white/10 text-slate-200 hover:bg-white/5 rounded-full">
          <Globe className="h-4 w-4 mr-2" />
          <span className="font-black tracking-widest uppercase">{currentLang === "en" ? "MY" : "EN"}</span>
        </Button>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black text-white">{t("Welcome to Britium Portal", "Britium Portal သို့ ကြိုဆိုပါသည်")}</h1>
          <p className="text-sm text-slate-300 mt-2">{t("Please log in to continue.", "ဆက်လက်အသုံးပြုရန် အကောင့်ဝင်ပါ။")}</p>
        </div>

        <Card className="bg-[#0B101B]/85 backdrop-blur-xl border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-400" />
          <CardContent className="p-8 space-y-5">
            {errorMsg && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {view === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("Password", "စကားဝှက်")} />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Login", "အကောင့်ဝင်မည်")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}