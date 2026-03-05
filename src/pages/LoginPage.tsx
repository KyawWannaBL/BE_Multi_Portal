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
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Globe,
  Loader2,
  Lock,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

type View = "login" | "forgot" | "request" | "force_change";

const OPS_ROLES = new Set([
  "OPERATIONS_ADMIN",
  "STAFF",
  "DATA_ENTRY",
  "SUPERVISOR",
  "WAREHOUSE_MANAGER",
  "SUBSTATION_MANAGER",
  "BRANCH_MANAGER",
  "ADM",
  "MGR",
  "SUPER_ADMIN",
  "SYS",
  "APP_OWNER",
]);

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
    return Boolean(
      supabase &&
        supabase.auth &&
        typeof supabase.auth.getSession === "function" &&
        typeof supabase.auth.signInWithPassword === "function"
    );
  } catch {
    return false;
  }
}

function readEnvHints() {
  const lines = [
    "Required environment variables (Vite):",
    "  VITE_SUPABASE_PROJECT_URL=https://xxxx.supabase.co",
    "  VITE_SUPABASE_ANON_KEY=eyJ...",
    "",
    "Notes:",
    "  - Must be set at build time (redeploy after setting in hosting).",
    "  - For local dev, use .env.local.",
  ];
  return lines.join("\n");
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

  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [configMissing, setConfigMissing] = useState(false);

  const brand = useMemo(
    () => ({
      title: "BRITIUM L5",
      subtitleEn: "Welcome to Britium Portal",
      subtitleMy: "Britium Portal သို့ ကြိုဆိုပါသည်",
      hintEn: "Please log in to continue.",
      hintMy: "ဆက်လက်အသုံးပြုရန် အကောင့်ဝင်ပါ။",
    }),
    []
  );

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

  async function loadProfileRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role, requires_password_change, full_name")
        .eq("id", userId)
        .single();

      if (error) return { role: "GUEST", requires_password_change: false };
      return data || { role: "GUEST", requires_password_change: false };
    } catch {
      return { role: "GUEST", requires_password_change: false };
    }
  }

  useEffect(() => {
    (async () => {
      const ok = supabaseReady();
      setConfigMissing(!ok);
      if (!ok) return;

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) return;

        if (data?.session?.user?.id) {
          const profile = await loadProfileRole(data.session.user.id);
          if (profile?.requires_password_change) {
            setView("force_change");
            return;
          }
          navigate(pathForRole(profile?.role), { replace: true });
        }
      } catch {
        // ignore
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!supabaseReady()) {
      setConfigMissing(true);
      setErrorMsg(t("System configuration is missing (Supabase env).", "System config မပြည့်စုံပါ (Supabase env)."));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const profile = await loadProfileRole(data.user.id);

      if (profile?.requires_password_change) {
        setView("force_change");
        setSuccessMsg(t("Password update required.", "စကားဝှက် ပြောင်းရန် လိုအပ်ပါသည်။"));
        setLoading(false);
        return;
      }

      // AuthContext should react to auth state; this is just for navigation.
      navigate(pathForRole(profile?.role), { replace: true });
    } catch (err: any) {
      setErrorMsg(t("Access Denied: Invalid credentials.", "ဝင်ရောက်ခွင့် ငြင်းပယ်ခံရသည်: အချက်အလက်မှားနေသည်။"));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!supabaseReady()) {
      setConfigMissing(true);
      setErrorMsg(t("System configuration is missing (Supabase env).", "System config မပြည့်စုံပါ (Supabase env)."));
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;

      setSuccessMsg(
        t(
          "Recovery link sent. Please check your email.",
          "Recovery link ကို ပို့ပြီးပါပြီ။ အီးမေးလ်ကို စစ်ဆေးပါ။"
        )
      );
    } catch (err: any) {
      setErrorMsg(err?.message || t("Unable to send recovery email.", "Recovery email ပို့မရပါ။"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!supabaseReady()) {
      setConfigMissing(true);
      setErrorMsg(t("System configuration is missing (Supabase env).", "System config မပြည့်စုံပါ (Supabase env)."));
      return;
    }

    setLoading(true);
    try {
      // Enterprise-friendly: use Supabase signup as an access request hook.
      // You can later enforce allow-list / admin approval via RLS + profile flags.
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setSuccessMsg(
        t(
          "Request submitted. Please verify your email if prompted.",
          "Request တင်ပြီးပါပြီ။ လိုအပ်ပါက အီးမေးလ်အတည်ပြုပါ။"
        )
      );
      setTimeout(() => setView("login"), 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || t("Request failed.", "Request မအောင်မြင်ပါ။"));
    } finally {
      setLoading(false);
    }
  }

  async function handleForceChange(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (newPassword !== confirmPassword) {
      setErrorMsg(t("Passwords do not match.", "စကားဝှက်များ မကိုက်ညီပါ။"));
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg(t("Password must be at least 8 characters.", "စကားဝှက်သည် အနည်းဆုံး ၈ လုံး ဖြစ်ရမည်။"));
      return;
    }

    if (!supabaseReady()) {
      setConfigMissing(true);
      setErrorMsg(t("System configuration is missing (Supabase env).", "System config မပြည့်စုံပါ (Supabase env)."));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      try {
        await supabase.from("profiles").update({ requires_password_change: false }).eq("id", data.user.id);
      } catch {
        // ignore
      }

      setSuccessMsg(
        t("Password updated. Redirecting…", "စကားဝှက် ပြောင်းပြီးပါပြီ။ ဆက်သွားနေပါသည်…")
      );

      const profile = await loadProfileRole(data.user.id);
      setTimeout(() => navigate(pathForRole(profile?.role), { replace: true }), 600);
    } catch (err: any) {
      setErrorMsg(err?.message || t("Password update failed.", "စကားဝှက်ပြောင်းမရပါ။"));
    } finally {
      setLoading(false);
    }
  }

  const pageTitle = useMemo(() => {
    if (view === "forgot") return t("Secure Password Recovery", "စကားဝှက် ပြန်လည်ရယူခြင်း");
    if (view === "request") return t("Request Access", "ဝင်ရောက်ခွင့် တောင်းမည်");
    if (view === "force_change") return t("Security Update Required", "လုံခြုံရေးအပ်ဒိတ် လိုအပ်");
    return t("Sign in", "အကောင့်ဝင်မည်");
  }, [view, currentLang]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080F] text-slate-100">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_20%,rgba(16,185,129,0.16),transparent_60%)]" />
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* Top bar */}
      <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-black/50 border border-white/10 overflow-hidden grid place-items-center">
            <img src="/logo.png" alt="Britium" className="h-7 w-7 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight">{brand.title}</div>
            <div className="text-[11px] text-slate-400">
              {t(brand.subtitleEn, brand.subtitleMy)}
            </div>
          </div>
        </div>

        <Button
          onClick={onToggleLanguage}
          variant="outline"
          className="bg-black/40 border-white/10 text-slate-200 hover:bg-white/5 rounded-full"
        >
          <Globe className="h-4 w-4 mr-2" />
          <span className="text-xs font-black tracking-widest uppercase">
            {currentLang === "en" ? "MY" : "EN"}
          </span>
        </Button>
      </div>

      {/* Center */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              {t("Welcome to Britium Portal", "Britium Portal သို့ ကြိုဆိုပါသည်")}
            </h1>
            <p className="text-sm text-slate-300 mt-2">{t(brand.hintEn, brand.hintMy)}</p>
          </div>

          {/* Config Missing */}
          {configMissing ? (
            <Card className="bg-[#0B101B]/85 backdrop-blur-xl border-white/10 rounded-[1.75rem] overflow-hidden shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                  {t("System Configuration Required", "System Config လိုအပ်သည်")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-300">
                  {t(
                    "Supabase environment variables are missing. Set them and redeploy.",
                    "Supabase env var မရှိသေးပါ။ ထည့်ပြီး redeploy လုပ်ပါ။"
                  )}
                </div>

                <pre className="text-[11px] whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-3 text-slate-300">
                  {readEnvHints()}
                </pre>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    className="border-white/10 bg-black/40 hover:bg-white/5"
                    onClick={() => navigator.clipboard.writeText(readEnvHints())}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {t("Copy", "ကူးယူ")}
                  </Button>

                  <Button
                    className="bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t("Reload", "ပြန်ဖွင့်")}
                  </Button>
                </div>

                <Separator className="bg-white/10" />

                <div className="text-xs text-slate-400 leading-relaxed">
                  {t(
                    "Enterprise note: Vite reads env at build time. Add env in hosting dashboard and redeploy.",
                    "Enterprise မှတ်ချက်: Vite သည် build time မှာ env ကိုဖတ်သည်။ Hosting dashboard ထဲမှာ ထည့်ပြီး redeploy လုပ်ပါ။"
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#0B101B]/85 backdrop-blur-xl border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-400" />

              <CardContent className="p-7 md:p-8 space-y-5">
                {/* Messages */}
                {errorMsg ? (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
                  </div>
                ) : null}

                {successMsg ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-300">
                    <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed">{successMsg}</p>
                  </div>
                ) : null}

                {/* Title row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <div className="font-extrabold">{pageTitle}</div>
                  </div>

                  {view !== "login" ? (
                    <Button
                      variant="ghost"
                      className="text-slate-300 hover:bg-white/5"
                      onClick={() => {
                        clearMessages();
                        setView("login");
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      {t("Back", "နောက်သို့")}
                    </Button>
                  ) : null}
                </div>

                {/* Forms */}
                {view === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12 focus:border-emerald-500/40"
                        placeholder={t("Corporate Email", "အီးမေးလ်")}
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12 focus:border-emerald-500/40"
                        placeholder={t("Password", "စကားဝှက်")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          clearMessages();
                          setView("forgot");
                        }}
                        className="text-[11px] text-slate-400 hover:text-emerald-300 font-bold uppercase"
                      >
                        {t("Forgot password?", "စကားဝှက် မေ့နေပါသလား?")}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          clearMessages();
                          setView("request");
                        }}
                        className="text-[11px] text-slate-400 hover:text-emerald-300 font-bold uppercase flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        {t("Request Access", "ဝင်ရောက်ခွင့် တောင်းမည်")}
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("Authenticating…", "စစ်ဆေးနေသည်…")}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {t("Login", "အကောင့်ဝင်မည်")}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                ) : null}

                {view === "forgot" ? (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div className="text-sm text-slate-300">
                      {t(
                        "Enter your email to receive a secure recovery link.",
                        "Recovery link ရယူရန် အီးမေးလ်ထည့်ပါ။"
                      )}
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12"
                        placeholder={t("Corporate Email", "အီးမေးလ်")}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-white font-black tracking-widest uppercase rounded-xl"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("Sending…", "ပို့နေသည်…")}
                        </span>
                      ) : (
                        t("Send Recovery Link", "Recovery Link ပို့မည်")
                      )}
                    </Button>
                  </form>
                ) : null}

                {view === "request" ? (
                  <form onSubmit={handleRequestAccess} className="space-y-4">
                    <div className="text-sm text-slate-300">
                      {t(
                        "This platform is for authorized personnel. Submit a request to create an account.",
                        "ဤစနစ်သည် ခွင့်ပြုထားသူများအတွက် ဖြစ်သည်။ အကောင့်ဖန်တီးရန် request တင်ပါ။"
                      )}
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12"
                        placeholder={t("Work Email", "အလုပ်အီးမေးလ်")}
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12"
                        placeholder={t("New Password", "စကားဝှက်အသစ်")}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black tracking-widest uppercase rounded-xl"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("Submitting…", "တင်နေသည်…")}
                        </span>
                      ) : (
                        t("Submit Request", "Request တင်မည်")
                      )}
                    </Button>

                    <div className="text-[11px] text-slate-400 leading-relaxed">
                      {t(
                        "By continuing, you agree to security monitoring and enterprise access policies.",
                        "ဆက်လုပ်ပါက လုံခြုံရေးစောင့်ကြည့်မှုနှင့် enterprise policy များကို သဘောတူသည်။"
                      )}
                    </div>
                  </form>
                ) : null}

                {view === "force_change" ? (
                  <form onSubmit={handleForceChange} className="space-y-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm">
                      {t(
                        "A password update is required before access is granted.",
                        "ဝင်ရောက်ခွင့်မပြုမီ စကားဝှက်အသစ်ပြောင်းရန် လိုအပ်ပါသည်။"
                      )}
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        type="password"
                        autoComplete="new-password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-black/40 border-amber-500/30 text-white h-12 rounded-xl pl-12"
                        placeholder={t("New Password", "စကားဝှက်အသစ်")}
                      />
                    </div>

                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-black/40 border-amber-500/30 text-white h-12 rounded-xl pl-12"
                        placeholder={t("Confirm Password", "စကားဝှက် အတည်ပြုပါ")}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-black tracking-widest uppercase rounded-xl"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t("Updating…", "ပြောင်းနေသည်…")}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {t("Update & Continue", "ပြောင်းပြီး ဆက်သွားမည်")}
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                ) : null}

                <Separator className="bg-white/10" />

                <div className="text-[11px] text-slate-400 leading-relaxed">
                  {t(
                    "Security Notice: Authorized personnel only. Activity may be monitored.",
                    "လုံခြုံရေးသတိပေးချက်: ခွင့်ပြုထားသူများသာ။ လုပ်ဆောင်မှုများကို စောင့်ကြည့်နိုင်သည်။"
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center mt-6 text-[11px] text-slate-500">
            © {new Date().getFullYear()} Britium Enterprise • {t("All rights reserved.", "မူပိုင်ခွင့် ရယူထားသည်။")}
          </div>
        </div>
      </div>
    </div>
  );
}