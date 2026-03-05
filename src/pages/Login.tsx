// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
// Unified import to prevent "Multiple GoTrueClient instances" warning
import { supabase, isSupabaseConfigured } from "@/lib/supabase"; 
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
  UserPlus
} from "lucide-react";

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
  // Schema-resilient selection
  const selects = [
    "role,must_change_password,employee_id,full_name",
    "role_code,must_change_password,employee_id,full_name",
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

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, toggleLang, setLanguage } = useLanguage();
  const auth = useAuth();

  const [currentLang, setCurrentLang] = useState(lang || "en");
  const t = (en: string, my: string) => (currentLang === "en" ? en : my);

  // --- BOOT STATES ---
  const [isBooting, setIsBooting] = useState(true);
  const [bootTimeout, setBootTimeout] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [bootLog, setBootLog] = useState("Initializing BRITIUM L5 Gateway...");

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

  useEffect(() => { if (lang) setCurrentLang(lang); }, [lang]);

  const toggleLanguage = () => {
    const next = currentLang === "en" ? "my" : "en";
    setCurrentLang(next);
    if (typeof setLanguage === "function") setLanguage(next);
    else if (typeof toggleLang === "function") toggleLang();
  };

  const clearMessages = () => { setErrorMsg(""); setSuccessMsg(""); };

  const fromPath = (location.state as any)?.from as string | undefined;
  const reason = (location.state as any)?.reason as string | undefined;

  // --- MERGED BOOT SEQUENCE & AUTH LOGIC ---
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeApp = async () => {
      try {
        setBootLog("Checking System Configuration...");
        if (!isSupabaseConfigured) {
          setBootLog("Configuration Fault: Supabase keys missing.");
          setBootTimeout(true);
          return;
        }

        // 1. Process Magic Link callback
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code && supabase.auth.exchangeCodeForSession) {
          setBootLog("Verifying Enterprise Link...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          
          url.searchParams.delete("code");
          window.history.replaceState({}, document.title, url.toString());
          if (auth?.refresh) await auth.refresh();
        }

        // 2. Check for session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data?.session?.user?.id) {
          setBootLog("Syncing User Profile...");
          await routeAfterAuth(data.session.user.id);
        } else {
          if (reason !== "MFA_REQUIRED") {
            setTimeout(() => setIsBooting(false), 1200);
          }
        }
      } catch (err: any) {
        setBootLog(`Critical Error: ${err.message}`);
        setBootTimeout(true);
      }
    };

    initializeApp();
    timeoutId = setTimeout(() => { if (isBooting) setBootTimeout(true); }, 8000);
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
    const role = normRole(profile?.role || profile?.role_code || auth?.role);
    const mustChange = Boolean(profile?.must_change_password) || Boolean(profile?.requires_password_change) || Boolean(auth?.mustChangePassword);

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
      const res = await auth.login(email, password);
      if (!res.success) throw new Error(res.message || "Invalid credentials.");
      
      if (auth?.refresh) await auth.refresh();
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user?.id) throw new Error("No session.");
      await routeAfterAuth(data.session.user.id);
    } catch (err) {
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
      setSuccessMsg(t("Secure link sent. Check your email.", "လုံခြုံသော link ပို့ပြီးပါပြီ။ Email စစ်ပါ။"));
      setOtpHint(t("If your email contains a 6-digit code, enter it below.", "Email ထဲတွင် ကုဒ် ၆ လုံးပါပါက အောက်တွင်ထည့်ပါ။"));
      setView("otp_verify");
    } catch (e: any) {
      setErrorMsg(e?.message || t("Unable to send magic link.", "Magic link ပို့မရပါ။"));
    } finally { setLoading(false); }
  }

  async function handleOtpVerify(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!otpToken.trim()) return setErrorMsg(t("Enter the code to continue.", "ဆက်လက်လုပ်ဆောင်ရန် ကုဒ်ထည့်ပါ။"));
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otpToken.trim(), type: "email" });
      if (error) throw error;
      if (auth?.refresh) await auth.refresh();
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user?.id) throw new Error("No session.");
      await routeAfterAuth(data.session.user.id);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Invalid verification code.", "အတည်ပြုကုဒ် မှားယွင်းနေသည်။"));
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
        await supabase.from("profiles").update({ must_change_password: false, requires_password_change: false }).eq("id", uid);
      }
      setSuccessMsg(t("Password updated. Syncing profile...", "စကားဝှက် ပြောင်းပြီးပါပြီ။ Profile ချိတ်ဆက်နေသည်..."));
      if (auth?.refresh) await auth.refresh();
      const { data: sess } = await supabase.auth.getSession();
      if (sess?.session?.user?.id) await routeAfterAuth(sess.session.user.id);
      else navigate("/", { replace: true });
    } catch (e: any) {
      setErrorMsg(e?.message || t("Update failed.", "ပြင်ဆင်မှု မအောင်မြင်ပါ။"));
    } finally { setLoading(false); }
  }

  async function ensureMfa() {
    try {
      const mfa = supabase.auth?.mfa;
      if (!mfa) return false;
      const { data, error } = await mfa.getAuthenticatorAssuranceLevel();
      if (!error && data?.currentLevel === "aal2") return true;
      return await prepareMfaVerify();
    } catch { return false; }
  }

  async function prepareMfaVerify() {
    try {
      const mfa = supabase.auth.mfa;
      const { data } = await mfa.listFactors();
      const verified = (data?.all || []).find((f: any) => f.status === "verified");
      if (verified?.id) {
        setMfaFactorId(verified.id);
        setView("mfa_verify");
        return false;
      }
      await enrollTotp();
      return false;
    } catch { await enrollTotp(); return false; }
  }

  async function enrollTotp() {
    clearMessages();
    setLoading(true);
    try {
      const mfa = supabase.auth.mfa;
      const { data, error } = await mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setMfaFactorId(data.id);
      setMfaQr(data.totp?.qr_code || null);
      setMfaSecret(data.totp?.secret || null);
      setView("mfa_enroll");
    } catch (e: any) {
      setErrorMsg(t("MFA enrollment failed.", "MFA စနစ် စတင်ရန် မအောင်မြင်ပါ။"));
    } finally { setLoading(false); }
  }

  async function verifyMfa(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const mfa = supabase.auth.mfa;
      if (typeof mfa.challengeAndVerify === "function") {
        const { error } = await mfa.challengeAndVerify({ factorId: mfaFactorId, code: mfaCode.trim() });
        if (error) throw error;
      }
      setSuccessMsg(t("MFA Verified. Access granted.", "MFA အောင်မြင်သည်။ ဝင်ရောက်ခွင့်ရပါပြီ။"));
      if (auth?.refresh) await auth.refresh();
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) await routeAfterAuth(data.session.user.id);
    } catch (e: any) {
      setErrorMsg(t("Invalid MFA code.", "MFA ကုဒ် မှားယွင်းနေသည်။"));
    } finally { setLoading(false); }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05080F] text-slate-100 p-4">
      {/* Dynamic Radial Background */}
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none grayscale">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />

      {/* Persistent Language Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <Button onClick={toggleLanguage} variant="outline" className="bg-black/40 border-white/10 text-slate-200 hover:bg-white/5 rounded-full px-4 backdrop-blur-md">
          <Globe className="w-4 h-4 mr-2 text-emerald-400" />
          <span className="font-black tracking-widest uppercase">{currentLang === "en" ? "MY" : "EN"}</span>
        </Button>
      </div>

      {isBooting ? (
        // ==========================================
        //  ENTERPRISE BOOT SEQUENCE UI
        // ==========================================
        <div className="relative z-10 w-full max-w-md p-4 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-white rounded-[24px] p-8 shadow-2xl border border-slate-200 flex flex-col gap-6 relative overflow-hidden">
            <div className="flex gap-5 items-center">
              <div className="w-14 h-14 shrink-0 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
              </div>
              <div className="flex-1">
                <h2 className="text-[16px] font-black text-slate-900 tracking-tight leading-tight">BRITIUM L5</h2>
                <p className="text-[12px] mt-1 text-slate-500 font-medium italic">
                  {t('Securing Gateway Environment...', 'လုံခြုံရေးစနစ်ကို ပြင်ဆင်နေပါသည်...')}
                </p>
                {!bootTimeout ? (
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-emerald-600 animate-spin" />
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      System Online
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {bootTimeout && (
              <div className="mt-2 pt-5 border-t border-dashed border-slate-200 animate-in fade-in slide-in-from-top-2">
                <p className="text-[12px] text-rose-600 font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t('Gateway response delayed.', 'စနစ်တုံ့ပြန်မှု နှောင့်နှေးနေပါသည်။')}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => window.location.reload()} className="bg-slate-900 text-white rounded-xl px-4 h-9">
                    <RefreshCw className="w-3 h-3 mr-2" /> {t('Retry', 'ထပ်လုပ်မည်')}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowDetails(!showDetails)} className="border-slate-200 text-slate-600 rounded-xl px-4 h-9">
                    {showDetails ? t('Hide', 'ကွယ်မည်') : t('Details', 'အသေးစိတ်')}
                  </Button>
                </div>
                {showDetails && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[10px] text-slate-500 break-all leading-relaxed">
                    {bootLog}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        // ==========================================
        //  MAIN BILINGUAL LOGIN UI
        // ==========================================
        <div className="relative z-10 w-full max-w-md space-y-6 animate-in slide-in-from-bottom-6 fade-in duration-700">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 bg-white/5 border border-white/10 rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl backdrop-blur-xl">
              <img src="/logo.png" alt="Britium" className="h-14 w-14 object-contain" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
              {t("Enterprise Portal", "Britium Portal")}
            </h1>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              {t("Authorized Access Only", "ခွင့်ပြုချက်ရသူများသာ ဝင်ရောက်နိုင်သည်")}
            </p>
          </div>

          <Card className="bg-[#111622]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden">
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-teal-400 to-emerald-600 animate-gradient-x" />

            <CardContent className="p-8 space-y-6">
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-300 animate-in shake-x duration-300">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{successMsg}</p>
                </div>
              )}

              {(view === "password" || view === "magic" || view === "otp_verify") && (
                <div className="flex gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                  <Button type="button" variant={view === "password" ? "default" : "ghost"} className={view === "password" ? "bg-emerald-600 hover:bg-emerald-500 text-white flex-1 rounded-xl shadow-lg" : "text-slate-400 flex-1 rounded-xl"} onClick={() => setView("password")}>
                    {t("Password", "စကားဝှက်")}
                  </Button>
                  <Button type="button" variant={view !== "password" ? "default" : "ghost"} className={view !== "password" ? "bg-[#D4AF37] hover:bg-[#b5952f] text-black flex-1 rounded-xl shadow-lg" : "text-slate-400 flex-1 rounded-xl"} onClick={() => setView("magic")}>
                    {t("Email Link", "အီးမေးလ်")}
                  </Button>
                </div>
              )}

              {view === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 rounded-2xl pl-12 h-14 text-white focus:border-emerald-500/50 transition-all shadow-inner" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/10 rounded-2xl pl-12 h-14 text-white focus:border-emerald-500/50 transition-all shadow-inner" placeholder={t("Password", "စကားဝှက်")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>{t("Authenticate", "စစ်ဆေးမည်")} <ArrowRight className="h-5 w-5 ml-2" /></>}
                  </Button>
                </form>
              )}

              {view === "magic" && (
                <form onSubmit={handleMagicSend} className="space-y-5">
                  <div className="text-[11px] text-slate-400 px-2 leading-relaxed italic">{t("System will dispatch a one-time secure link to your work inbox.", "စနစ်မှ တစ်ခါသုံး လုံခြုံရေး link ကို သင့်အီးမေးလ်သို့ ပို့ပေးပါမည်။")}</div>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                    <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 rounded-2xl pl-12 h-14 text-white" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black tracking-widest uppercase rounded-2xl shadow-xl transition-all">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("Send Link", "Link ပို့မည်")}
                  </Button>
                </form>
              )}

              {view === "otp_verify" && (
                <form onSubmit={handleOtpVerify} className="space-y-5">
                  <div className="text-xs text-emerald-400 font-bold px-2">{otpHint}</div>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                    <Input required value={otpToken} onChange={(e) => setOtpToken(e.target.value)} className="bg-black/40 border-white/10 rounded-2xl pl-12 h-14 text-white font-mono tracking-[0.5em] text-center" placeholder="000000" maxLength={6} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-2xl">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("Verify & Login", "အတည်ပြုပြီး ဝင်မည်")}
                  </Button>
                </form>
              )}

              {(view === "mfa_enroll" || view === "mfa_verify") && (
                <form onSubmit={verifyMfa} className="space-y-6">
                  {view === "mfa_enroll" ? (
                    <div className="space-y-4">
                      <div className="text-[11px] text-emerald-400 font-bold px-2">{t("SCAN THIS QR WITH AUTHENTICATOR APP", "Authenticator app ဖြင့် ဤ QR ကို စကန်ဖတ်ပါ")}</div>
                      {mfaQr && <div className="rounded-3xl border border-white/10 bg-white p-5 flex justify-center shadow-inner"><img src={mfaQr} alt="MFA" className="w-44 h-44 object-contain" /></div>}
                      {mfaSecret && (
                        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-2">
                          <div className="text-[9px] text-slate-500 font-mono break-all">{mfaSecret}</div>
                          <Button type="button" variant="outline" size="sm" className="w-full h-8 border-white/5 bg-white/5 text-[10px] rounded-lg" onClick={() => {navigator.clipboard.writeText(mfaSecret); alert("Secret Copied");}}>
                            <Copy className="h-3 w-3 mr-2" /> {t("Copy Secret", "ကူးယူမည်")}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium px-2">{t("Security Gate: Provide secondary authentication factor.", "လုံခြုံရေးဂိတ်: ဒုတိယအဆင့် အတည်ပြုကုဒ် ထည့်ပါ။")}</div>
                  )}
                  <div className="relative group">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-500" />
                    <Input required value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} className="bg-black/40 border-white/10 rounded-2xl pl-12 h-14 text-white text-center tracking-[1em] font-bold" placeholder="------" maxLength={6} />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-2xl">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("Verify MFA", "MFA စစ်ဆေးမည်")}
                  </Button>
                </form>
              )}

              {view === "force_change" && (
                <form onSubmit={handleForceChange} className="space-y-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200 text-xs font-bold leading-relaxed">
                    {t("Policy requirement: Password update mandatory for first-time login.", "မူဝါဒလိုအပ်ချက်- ပထမဆုံးအကြိမ် ဝင်ရောက်ခြင်းအတွက် စကားဝှက်ပြောင်းလဲရန် လိုအပ်ပါသည်။")}
                  </div>
                  <Input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-black/40 border-white/10 rounded-2xl h-14 text-white px-5" placeholder={t("New Password", "စကားဝှက်အသစ်")} />
                  <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-black/40 border-white/10 rounded-2xl h-14 text-white px-5" placeholder={t("Confirm Password", "စကားဝှက် အတည်ပြုပါ")} />
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-2xl">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t("Secure & Continue", "ပြောင်းလဲပြီး ဆက်သွားမည်")}
                  </Button>
                </form>
              )}

              <Separator className="bg-white/5" />
              <div className="text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold leading-loose">
                {t("Network Security: Authorized Monitoring Active", "ကွန်ရက်လုံခြုံရေး- စောင့်ကြည့်စစ်ဆေးမှု ပြုလုပ်နေပါသည်")}
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-[11px] text-slate-500 font-bold opacity-60">
            © {new Date().getFullYear()} Britium Enterprise • {t("All rights reserved.", "မူပိုင်ခွင့် ရယူထားသည်။")}
          </div>
        </div>
      )}
    </div>
  );
}