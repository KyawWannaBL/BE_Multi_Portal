// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Copy, Globe, Loader2, Lock, Mail, RefreshCw, ShieldCheck, UserPlus } from "lucide-react";

type View = "password" | "magic" | "otp_verify" | "forgot" | "request" | "force_change" | "mfa_enroll" | "mfa_verify";

const ADMIN_MFA_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "ADMIN", "ADM", "MGR"]);
const EXEC_ROLES = new Set(["RIDER", "DRIVER", "HELPER"]);

function normRole(role?: string | null) {
  const r = (role ?? "").trim().toUpperCase();
  if (!r) return "GUEST";
  if (r.startsWith("SUPER")) return "SUPER_ADMIN";
  if (r.startsWith("APP")) return "APP_OWNER";
  if (r.startsWith("SYS")) return "SYS";
  return r;
}

function portalForRole(role?: string | null) {
  const r = normRole(role);
  if (r === "FINANCE" || r === "FINANCE_ADMIN" || r === "ACCOUNTANT") return "/portal/finance";
  if (EXEC_ROLES.has(r)) return "/portal/execution";
  return "/portal/operations";
}

async function loadProfile(userId: string) {
  const selects = [
    "role,must_change_password,employee_id,full_name",
    "role_code,must_change_password,employee_id,full_name",
    "app_role,must_change_password,employee_id,full_name",
    "requires_password_change,employee_id,full_name",
  ];
  for (const sel of selects) {
    try {
      const { data, error } = await supabase.from("profiles").select(sel).eq("id", userId).maybeSingle();
      if (!error && data) return data;
    } catch {}
  }
  return null;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang, setLanguage } = useLanguage();
  const auth = useAuth?.();

  const [currentLang, setCurrentLang] = useState(lang || "en");
  const t = (en: string, my: string) => (currentLang === "en" ? en : my);

  // --- BOOT STATES ---
  const [isBooting, setIsBooting] = useState(true);
  const [bootTimeout, setBootTimeout] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [bootLog, setBootLog] = useState("Initializing BRITIUM L5...");

  // --- LOGIN STATES ---
  const [view, setView] = useState<View>("password");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpHint, setOtpHint] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaQr, setMfaQr] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fromPath = (location.state as any)?.from as string | undefined;
  const reason = (location.state as any)?.reason as string | undefined;

  useEffect(() => { if (lang) setCurrentLang(lang); }, [lang]);

  const toggleLanguage = () => {
    const next = currentLang === "en" ? "my" : "en";
    setCurrentLang(next);
    if (typeof setLanguage === "function") setLanguage(next);
    else if (typeof toggleLang === "function") toggleLang();
  };

  const clearMessages = () => { setErrorMsg(""); setSuccessMsg(""); };

  // --- BOOT SEQUENCE LOGIC ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeApp = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code && supabase.auth.exchangeCodeForSession) {
          setBootLog("Verifying Magic Link...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          url.searchParams.delete("code");
          window.history.replaceState({}, document.title, url.toString());
        }

        setBootLog("Checking Enterprise Access...");
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user?.id) {
          setBootLog("Active session found. Redirecting...");
          await routeAfterAuth(data.session.user.id);
        } else {
          if (reason !== "MFA_REQUIRED") {
            setTimeout(() => setIsBooting(false), 1200);
          }
        }
      } catch (err: any) {
        setBootLog(`Error: ${err.message}`);
        setBootTimeout(true);
      }
    };

    initializeApp();

    timeoutId = setTimeout(() => {
      if (isBooting) setBootTimeout(true);
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, [reason]);

  useEffect(() => {
    if (reason === "MFA_REQUIRED") {
      setIsBooting(false); 
      setSuccessMsg(t("MFA required. Please verify to continue.", "MFA လိုအပ်သည်။ ဆက်ရန် စစ်ဆေးပါ။"));
      setView("mfa_verify");
      void prepareMfaVerify();
    }
  }, [reason]);

  async function routeAfterAuth(userId: string) {
    const profile = await loadProfile(userId);
    const role = normRole(profile?.role || profile?.role_code || profile?.app_role);
    const mustChange = Boolean(profile?.must_change_password) || Boolean(profile?.requires_password_change);

    if (mustChange) {
      setIsBooting(false);
      setView("force_change");
      return;
    }

    if (ADMIN_MFA_ROLES.has(role)) {
      const ok = await ensureMfa();
      if (!ok) {
        setIsBooting(false);
        return;
      }
    }
    navigate(fromPath || portalForRole(role), { replace: true });
  }

  // --- HANDLERS ---
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data?.user?.id) throw new Error("No session.");
      await routeAfterAuth(data.user.id);
    } catch {
      setErrorMsg(t("Access Denied: Invalid credentials.", "ဝင်ရောက်ခွင့် ငြင်းပယ်ခံရသည်: အချက်အလက်မှားနေသည်။"));
    } finally { setLoading(false); }
  }

  async function handleMagicSend(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const emailRedirectTo = `${window.location.origin}/login`;
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } });
      if (error) throw error;
      setSuccessMsg(t("Email sent. Open the link (or enter the OTP code).", "အီးမေးလ်ပို့ပြီးပါပြီ။ Link ကိုဖွင့်ပါ (သို့) OTP code ပါလျှင် ထည့်ပါ။"));
      setOtpHint(t("If your email contains a code, enter it below.", "Email ထဲမှာ code ပါရင် အောက်မှာထည့်ပါ။"));
      setView("otp_verify");
    } catch (e: any) {
      setErrorMsg(e?.message || t("Unable to send magic link.", "Magic link ပို့မရပါ။"));
    } finally { setLoading(false); }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!otpToken.trim()) return setErrorMsg(t("Enter the OTP code.", "OTP code ကို ထည့်ပါ။"));
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otpToken.trim(), type: "email" });
      if (error) throw error;
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user?.id) throw new Error("No session.");
      await routeAfterAuth(data.session.user.id);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Invalid OTP code.", "OTP code မမှန်ပါ။"));
    } finally { setLoading(false); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setSuccessMsg(t("Recovery link sent. Please check your email.", "Recovery link ကိုပို့ပြီးပါပြီ။ အီးမေးလ်ကို စစ်ပါ။"));
      setView("password");
    } catch (e: any) {
      setErrorMsg(e?.message || t("Unable to send recovery email.", "Recovery email ပို့မရပါ။"));
    } finally { setLoading(false); }
  }

  async function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setSuccessMsg(t("Request submitted. Verify your email if prompted.", "Request တင်ပြီးပါပြီ။ လိုအပ်ပါက အီးမေးလ်အတည်ပြုပါ။"));
      setView("password");
    } catch (e: any) {
      setErrorMsg(e?.message || t("Request failed.", "Request မအောင်မြင်ပါ။"));
    } finally { setLoading(false); }
  }

  async function handleForceChange(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (newPassword !== confirmPassword) return setErrorMsg(t("Passwords do not match.", "စကားဝှက်များ မကိုက်ညီပါ။"));
    if (newPassword.length < 8) return setErrorMsg(t("Password must be at least 8 characters.", "စကားဝှက်သည် အနည်းဆုံး ၈ လုံး ဖြစ်ရမည်။"));
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      const uid = data?.user?.id;
      if (uid) {
        try { await supabase.from("profiles").update({ must_change_password: false, requires_password_change: false }).eq("id", uid); } catch {}
      }
      setSuccessMsg(t("Password updated. Redirecting…", "စကားဝှက် ပြောင်းပြီးပါပြီ။ ဆက်သွားနေသည်…"));
      const { data: sess } = await supabase.auth.getSession();
      if (sess?.session?.user?.id) await routeAfterAuth(sess.session.user.id);
      else navigate("/", { replace: true });
    } catch (e: any) {
      setErrorMsg(e?.message || t("Password update failed.", "စကားဝှက်ပြောင်းမရပါ။"));
    } finally { setLoading(false); }
  }

  async function ensureMfa() {
    try {
      const mfa = supabase.auth?.mfa;
      if (!mfa) {
        setErrorMsg(t("MFA is required for admin roles.", "Admin role များအတွက် MFA လိုအပ်ပါသည်။"));
        return false;
      }
      const { data, error } = await mfa.getAuthenticatorAssuranceLevel();
      if (!error && data?.currentLevel === "aal2") return true;
      return await prepareMfaVerify();
    } catch (e: any) {
      return false;
    }
  }

  async function prepareMfaVerify() {
    try {
      const mfa = supabase.auth.mfa;
      const { data } = await mfa.listFactors();
      const verified = (data?.all || []).find((f: any) => f.status === "verified");

      if (verified?.id) {
        setMfaFactorId(verified.id);
        setView("mfa_verify");
        setSuccessMsg(t("Admin MFA required.", "Admin MFA လိုအပ်သည်။"));
        return false;
      }
      await enrollTotp();
      return false;
    } catch {
      await enrollTotp();
      return false;
    }
  }

  async function enrollTotp() {
    clearMessages();
    setLoading(true);
    try {
      const mfa = supabase.auth.mfa;
      const { data, error } = await mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setMfaFactorId(data.id);
      setMfaQr(data.totp?.qr_code || data.qr_code || null);
      setMfaSecret(data.totp?.secret || data.secret || null);
      setView("mfa_enroll");
      setSuccessMsg(t("Scan QR, then enter the 6-digit code.", "QR စကန်ပြီး ၆ လုံးကုဒ် ထည့်ပါ။"));
    } catch (e: any) {
      setErrorMsg(e?.message || "MFA enrollment failed.");
    } finally { setLoading(false); }
  }

  async function verifyMfa(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const mfa = supabase.auth.mfa;
      const factorId = mfaFactorId;
      if (!mfa || !factorId) throw new Error("Missing MFA factor.");

      if (typeof mfa.challengeAndVerify === "function") {
        const { error } = await mfa.challengeAndVerify({ factorId, code: mfaCode.trim() });
        if (error) throw error;
      } else {
        const ch = await mfa.challenge({ factorId });
        if (ch.error) throw ch.error;
        const vr = await mfa.verify({ factorId, challengeId: ch.data.id, code: mfaCode.trim() });
        if (vr.error) throw vr.error;
      }

      setSuccessMsg(t("MFA verified. Redirecting…", "MFA အတည်ပြုပြီးပါပြီ။ ဆက်သွားနေသည်…"));
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) await routeAfterAuth(data.session.user.id);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Invalid MFA code.", "MFA ကုဒ် မမှန်ပါ။"));
    } finally { setLoading(false); }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05080F] text-slate-100 p-4">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="absolute top-6 right-6 z-20">
        <Button onClick={toggleLanguage} variant="outline" className="bg-black/40 border-white/10 text-slate-200 hover:bg-white/5 rounded-full px-4">
          <Globe className="w-4 h-4 mr-2" />
          <span className="font-black tracking-widest uppercase">{currentLang === "en" ? "MY" : "EN"}</span>
        </Button>
      </div>

      {isBooting ? (
        <div className="relative z-10 w-full max-w-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[18px] p-5 shadow-2xl border border-slate-200 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex gap-4 items-center">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex-1">
                <h2 className="text-[14px] font-extrabold text-slate-900 tracking-[0.2px] m-0 leading-tight">BRITIUM L5</h2>
                <p className="text-[12px] mt-1 text-slate-500 leading-snug">
                  {t('Loading... / ဖွင့်နေသည်...', 'Loading... / ဖွင့်နေသည်...')}
                </p>
                {!bootTimeout ? (
                  <div className="flex items-center gap-2.5 mt-3 flex-wrap">
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin" />
                    <span className="text-[11px] px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 bg-slate-50">
                      Starting...
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
            {bootTimeout && (
              <div className="mt-2 pt-4 border-t border-dashed border-slate-200 animate-in fade-in">
                <p className="text-[12px] text-slate-600 mb-3 leading-relaxed">
                  Taking longer than expected. Please check your connection.
                </p>
                <Button size="sm" onClick={() => window.location.reload()} className="h-8 text-xs bg-slate-900 text-white rounded-lg">
                  <RefreshCw className="w-3 h-3 mr-1.5" /> Reload
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-10 w-full max-w-md space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-5 shadow-2xl overflow-hidden">
              <img src="/logo.png" alt="Britium" className="h-12 w-12 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">{t("Welcome to Britium Portal", "Britium Portal သို့ ကြိုဆိုပါသည်")}</h1>
            <p className="text-sm text-slate-300 mt-1">{t("Please log in to continue.", "ဆက်လက်အသုံးပြုရန် အကောင့်ဝင်ပါ။")}</p>
          </div>

          <Card className="bg-[#111622]/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-400" />
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                {t("Secure Access", "လုံခြုံသော ဝင်ရောက်မှု")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-7 space-y-5">
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
                </div>
              )}
              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{successMsg}</p>
                </div>
              )}

              {(view === "password" || view === "magic" || view === "otp_verify") && (
                <div className="flex gap-2">
                  <Button type="button" variant={view === "password" ? "default" : "outline"} className={view === "password" ? "bg-emerald-600 hover:bg-emerald-500 flex-1" : "border-white/10 bg-black/30 hover:bg-white/5 flex-1"} onClick={() => { clearMessages(); setView("password"); }}>{t("Password", "စကားဝှက်")}</Button>
                  <Button type="button" variant={view === "magic" || view === "otp_verify" ? "default" : "outline"} className={(view === "magic" || view === "otp_verify") ? "bg-[#D4AF37] hover:bg-[#b5952f] text-black flex-1" : "border-white/10 bg-black/30 hover:bg-white/5 flex-1"} onClick={() => { clearMessages(); setView("magic"); }}>{t("Email Link/OTP", "Email Link/OTP")}</Button>
                </div>
              )}

              {view === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white focus:border-emerald-500/50" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white focus:border-emerald-500/50" placeholder={t("Password", "စကားဝှက်")} />
                  </div>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => { clearMessages(); setView("forgot"); }} className="text-[11px] text-slate-400 hover:text-emerald-300 font-bold uppercase">{t("Forgot password?", "စကားဝှက် မေ့နေပါသလား?")}</button>
                    <button type="button" onClick={() => { clearMessages(); setView("request"); }} className="text-[11px] text-slate-400 hover:text-emerald-300 font-bold uppercase flex items-center gap-2"><UserPlus className="h-4 w-4" /> {t("Request Access", "ဝင်ရောက်ခွင့် တောင်းမည်")}</button>
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{t("Authenticate", "အကောင့်ဝင်မည်")} <ArrowRight className="h-4 w-4 ml-2" /></>}
                  </Button>
                </form>
              )}

              {view === "magic" && (
                <form onSubmit={handleMagicSend} className="space-y-4">
                  <div className="text-xs text-slate-300">{t("We will send a secure login link (or OTP code).", "လုံခြုံသော login link (သို့) OTP code ကို ပို့ပါမည်။")}</div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black tracking-widest uppercase rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Send Link / OTP", "Link / OTP ပို့မည်")}
                  </Button>
                </form>
              )}

              {view === "otp_verify" && (
                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="text-xs text-slate-300">{otpHint || t("Enter the OTP code from email.", "Email ထဲက OTP code ကိုထည့်ပါ။")}</div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input required value={otpToken} onChange={(e) => setOtpToken(e.target.value)} className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white" placeholder={t("OTP code", "OTP code")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Verify & Login", "စစ်ပြီး အကောင့်ဝင်မည်")}
                  </Button>
                </form>
              )}

              {view === "forgot" && (
                <form onSubmit={handleForgot} className="space-y-4">
                  <Button type="button" variant="ghost" className="px-0 text-slate-300 hover:bg-transparent" onClick={() => { clearMessages(); setView("password"); }}><ArrowLeft className="h-4 w-4 mr-2" /> {t("Back", "နောက်သို့")}</Button>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-white font-black tracking-widest uppercase rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Send Recovery Link", "Recovery Link ပို့မည်")}
                  </Button>
                </form>
              )}

              {view === "request" && (
                <form onSubmit={handleRequestAccess} className="space-y-4">
                  <Button type="button" variant="ghost" className="px-0 text-slate-300 hover:bg-transparent" onClick={() => { clearMessages(); setView("password"); }}><ArrowLeft className="h-4 w-4 mr-2" /> {t("Back", "နောက်သို့")}</Button>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white" placeholder={t("Work Email", "အလုပ်အီးမေးလ်")} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white" placeholder={t("New Password", "စကားဝှက်အသစ်")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black tracking-widest uppercase rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Submit Request", "Request တင်မည်")}
                  </Button>
                </form>
              )}

              {view === "force_change" && (
                <form onSubmit={handleForceChange} className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm">
                    {t("Password update required before access.", "ဝင်ရောက်ခွင့်မပြုမီ စကားဝှက်အသစ်ပြောင်းရန် လိုအပ်ပါသည်။")}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-[#0B0E17] border border-amber-500/30 rounded-xl pl-12 h-12 text-white" placeholder={t("New Password", "စကားဝှက်အသစ်")} />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-[#0B0E17] border border-amber-500/30 rounded-xl pl-12 h-12 text-white" placeholder={t("Confirm Password", "စကားဝှက် အတည်ပြုပါ")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-black tracking-widest uppercase rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Update & Continue", "ပြောင်းပြီး ဆက်သွားမည်")}
                  </Button>
                </form>
              )}

              {(view === "mfa_enroll" || view === "mfa_verify") && (
                <form onSubmit={verifyMfa} className="space-y-4">
                  {view === "mfa_enroll" ? (
                    <>
                      <div className="text-xs text-slate-300">{t("Scan QR with Authenticator app, then enter the code.", "Authenticator app ဖြင့် QR စကန်ပြီး ကုဒ်ထည့်ပါ။")}</div>
                      {mfaQr && <div className="rounded-xl border border-white/10 bg-white p-3 grid place-items-center"><img src={mfaQr} alt="MFA QR" className="w-48 h-48 object-contain" /></div>}
                      {mfaSecret && (
                        <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-300">
                          <div className="font-mono break-all">{mfaSecret}</div>
                          <Button type="button" variant="outline" className="mt-2 border-white/10 bg-black/40 hover:bg-white/5" onClick={() => navigator.clipboard.writeText(mfaSecret)}><Copy className="h-4 w-4 mr-2" /> {t("Copy Secret", "Secret ကူးယူ")}</Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-xs text-slate-300">{t("Enter your Authenticator code to continue.", "ဆက်ရန် Authenticator ကုဒ်ထည့်ပါ။")}</div>
                  )}
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <Input required value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white" placeholder={t("6-digit code", "ကုဒ် ၆ လုံး")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Verify MFA", "MFA စစ်မည်")}
                  </Button>
                  <Button type="button" variant="outline" className="w-full h-12 border-white/10 bg-black/30 hover:bg-white/5 rounded-xl" onClick={() => enrollTotp()}>{t("Enroll new Authenticator", "Authenticator အသစ် ထည့်သွင်းမည်")}</Button>
                </form>
              )}
              <Separator className="bg-white/10" />
              <div className="text-[11px] text-slate-400 leading-relaxed">{t("Security Notice: Authorized personnel only. Activity may be monitored.", "လုံခြုံရေးသတိပေးချက်: ခွင့်ပြုထားသူများသာ။ လုပ်ဆောင်မှုများကို စောင့်ကြည့်နိုင်သည်။")}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}