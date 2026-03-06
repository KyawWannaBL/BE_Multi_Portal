// @ts-nocheck
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase, SUPABASE_CONFIGURED } from "@/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { defaultPortalForRole, normalizeRole } from "@/lib/portalRegistry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Copy, Globe, Loader2, Lock, Mail, RefreshCw, ShieldCheck, UserPlus } from "lucide-react";

type View = "login" | "forgot" | "request" | "force_change" | "mfa";

const MFA_REQUIRED_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A", "ADM", "MGR", "ADMIN"]);

function supabaseReady() {
  return Boolean(SUPABASE_CONFIGURED);
}

function readEnvHints() {
  return "Required environment variables (Vite):\n  VITE_SUPABASE_PROJECT_URL=https://xxxx.supabase.co\n  VITE_SUPABASE_ANON_KEY=eyJ...\n";
}

async function loadProfile(userId: string) {
  const trySelect = async (sel: string) => supabase.from("profiles").select(sel).eq("id", userId).maybeSingle();
  let { data, error } = await trySelect("id, role, role_code, app_role, user_role, must_change_password, requires_password_change");
  if (error && (error as any).code === "42703") {
    ({ data, error } = await trySelect("id, role, must_change_password"));
  }
  if (error) return { role: "GUEST", mustChange: false };
  const row: any = data || {};
  const rawRole = row.role ?? row.app_role ?? row.user_role ?? row.role_code ?? "GUEST";
  const mustChange = Boolean(row.must_change_password) || Boolean(row.requires_password_change);
  return { role: normalizeRole(rawRole), mustChange };
}

async function hasAal2() {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return false;
    return data?.currentLevel === "aal2";
  } catch {
    return false;
  }
}

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const auth = useAuth();
  const { lang, setLanguage, toggleLang } = useLanguage();
  const [currentLang, setCurrentLang] = useState(lang || "en");
  const t = (en: string, my: string) => (currentLang === "en" ? en : my);

  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState(false);
  const [configMissing, setConfigMissing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [targetPath, setTargetPath] = useState<string>("/");

  const [mfaStage, setMfaStage] = useState<"idle" | "enroll" | "verify">("idle");
  const [mfaFactorId, setMfaFactorId] = useState<string>("");
  const [mfaChallengeId, setMfaChallengeId] = useState<string>("");
  const [mfaQrSvg, setMfaQrSvg] = useState<string>("");
  const [mfaSecret, setMfaSecret] = useState<string>("");
  const [mfaUri, setMfaUri] = useState<string>("");

  const brand = useMemo(() => ({ title: "BRITIUM L5", subtitleEn: "Welcome to Britium Portal", subtitleMy: "Britium Portal သို့ ကြိုဆိုပါသည်", hintEn: "Please log in to continue.", hintMy: "ဆက်လက်အသုံးပြုရန် အကောင့်ဝင်ပါ။" }), []);

  useEffect(() => { if (lang) setCurrentLang(lang); }, [lang]);
  const toggleLanguage = () => {
    const next = currentLang === "en" ? "my" : "en";
    setCurrentLang(next);
    if (typeof setLanguage === "function") setLanguage(next);
    else if (typeof toggleLang === "function") toggleLang();
  };

  const clearMessages = () => { setErrorMsg(""); setSuccessMsg(""); };

  async function goAfterAuth(role?: string) {
    const from = loc?.state?.from;
    const dst = (typeof from === "string" && from.startsWith("/")) ? from : defaultPortalForRole(role);
    setTargetPath(dst);
    nav(dst, { replace: true });
  }

  async function ensureMfa(role?: string) {
    const r = normalizeRole(role);
    if (!MFA_REQUIRED_ROLES.has(r)) return true;
    const ok = await hasAal2();
    if (ok) return true;
    setView("mfa");
    await prepareMfa();
    return false;
  }

  async function prepareMfa() {
    setMfaStage("idle"); setOtp(""); setMfaQrSvg(""); setMfaSecret(""); setMfaUri(""); setMfaFactorId(""); setMfaChallengeId("");
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const totpFactors = (data?.totp || data?.all || []) as any[];
      const verified = totpFactors.find((f) => (f?.status || "").toLowerCase() === "verified") || totpFactors[0];

      if (verified?.id) {
        const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: verified.id });
        if (chErr) throw chErr;
        setMfaFactorId(verified.id); setMfaChallengeId(ch?.id || ""); setMfaStage("verify");
        setSuccessMsg(t("Enter your 6-digit authenticator code.", "Authenticator code (၆ လုံး) ကို ထည့်ပါ။"));
        return;
      }

      const { data: enr, error: enrErr } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (enrErr) throw enrErr;
      setMfaFactorId(enr?.id || ""); setMfaQrSvg(enr?.totp?.qr_code || ""); setMfaSecret(enr?.totp?.secret || ""); setMfaUri(enr?.totp?.uri || "");

      const { data: ch2, error: ch2Err } = await supabase.auth.mfa.challenge({ factorId: enr.id });
      if (ch2Err) throw ch2Err;
      setMfaChallengeId(ch2?.id || ""); setMfaStage("enroll");
      setSuccessMsg(t("Scan QR with authenticator app, then enter the code.", "Authenticator နဲ့ QR စကန်ပြီး code ထည့်ပါ။"));
    } catch (e: any) {
      setErrorMsg(e?.message || t("MFA setup failed.", "MFA စတင်မရပါ။"));
      setMfaStage("idle");
    } finally { setLoading(false); }
  }

  async function verifyMfa(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!otp || otp.trim().length < 6) return setErrorMsg(t("Enter the 6-digit code.", "Code ၆ လုံး ထည့်ပါ။"));
    setLoading(true);
    try {
      const code = otp.trim().replace(/\s+/g, "");
      const { error } = await supabase.auth.mfa.verify({ factorId: mfaFactorId, challengeId: mfaChallengeId, code });
      if (error) throw error;
      const ok = await hasAal2();
      if (!ok) throw new Error("MFA verification incomplete (AAL2 not reached).");
      setSuccessMsg(t("MFA verified. Redirecting…", "MFA အောင်မြင်ပါပြီ။ ဆက်သွားနေသည်…"));
      setTimeout(() => nav(targetPath || "/", { replace: true }), 400);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Invalid code.", "Code မမှန်ပါ။"));
    } finally { setLoading(false); }
  }

  useEffect(() => {
    (async () => {
      const ok = supabaseReady();
      setConfigMissing(!ok);
      if (!ok) return;
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data?.session?.user?.id;
        if (!userId) return;

        const prof = await loadProfile(userId);
        const from = loc?.state?.from;
        const dst = (typeof from === "string" && from.startsWith("/")) ? from : defaultPortalForRole(prof.role);
        setTargetPath(dst);

        if (prof.mustChange) { setView("force_change"); return; }
        const need = MFA_REQUIRED_ROLES.has(normalizeRole(prof.role));
        if (need) {
          const okAal = await hasAal2();
          if (!okAal) { setView("mfa"); await prepareMfa(); return; }
        }
        nav(dst, { replace: true });
      } catch {}
    })();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!supabaseReady()) { setConfigMissing(true); return setErrorMsg(t("System configuration is missing.", "System config မပြည့်စုံပါ။")); }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      await auth.refresh?.();
      const prof = await loadProfile(data.user.id);
      const dst = defaultPortalForRole(prof.role);
      setTargetPath(dst);

      const isDefault = password === "P@ssw0rd1" || password.startsWith("Britium@");
      if (prof.mustChange || isDefault) {
        setView("force_change");
        setLoading(false);
        return;
      }

      const passed = await ensureMfa(prof.role);
      if (!passed) { setLoading(false); return; }
      await goAfterAuth(prof.role);
    } catch (e: any) {
      setErrorMsg(t("Access Denied: Invalid credentials.", "ဝင်ရောက်ခွင့် ငြင်းပယ်ခံရသည်: အချက်အလက်မှားနေသည်။"));
    } finally { setLoading(false); }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!supabaseReady()) { setConfigMissing(true); return setErrorMsg(t("System config missing.", "System config မပြည့်စုံပါ။")); }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      setSuccessMsg(t("Recovery link sent. Please check your email.", "Recovery link ကို ပို့ပြီးပါပြီ။ အီးမေးလ်ကို စစ်ပါ။"));
    } catch (e: any) {
      setErrorMsg(e?.message || t("Unable to send recovery email.", "Recovery email ပို့မရပါ။"));
    } finally { setLoading(false); }
  }

  async function handleRequestAccess(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();
    if (!supabaseReady()) { setConfigMissing(true); return setErrorMsg(t("System config missing.", "System config မပြည့်စုံပါ။")); }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      setSuccessMsg(t("Request submitted. Please verify your email if prompted.", "Request တင်ပြီးပါပြီ။ လိုအပ်ပါက အီးမေးလ်အတည်ပြုပါ။"));
      setTimeout(() => setView("login"), 900);
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
      try { await supabase.from("profiles").update({ must_change_password: false, requires_password_change: false }).eq("id", data.user.id); } catch {}
      await auth.refresh?.();
      const prof = await loadProfile(data.user.id);
      const passed = await ensureMfa(prof.role);
      if (!passed) { setLoading(false); return; }
      setSuccessMsg(t("Password updated. Redirecting…", "စကားဝှက် ပြောင်းပြီးပါပြီ။ ဆက်သွားနေသည်…"));
      setTimeout(() => goAfterAuth(prof.role), 450);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Password update failed.", "စကားဝှက်ပြောင်းမရပါ။"));
    } finally { setLoading(false); }
  }

  const pageTitle = useMemo(() => {
    if (view === "forgot") return t("Secure Password Recovery", "စကားဝှက် ပြန်လည်ရယူခြင်း");
    if (view === "request") return t("Request Access", "ဝင်ရောက်ခွင့် တောင်းမည်");
    if (view === "force_change") return t("Security Update Required", "လုံခြုံရေး အပ်ဒိတ် လိုအပ်");
    if (view === "mfa") return t("Multi-Factor Verification", "အဆင့်မြင့် အတည်ပြုခြင်း (MFA)");
    return t("Sign in", "အကောင့်ဝင်မည်");
  }, [view, currentLang]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080F] text-slate-100">
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none grayscale">
        <source src="/background.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_20%,rgba(16,185,129,0.16),transparent_60%)]" />

      <div className="absolute top-6 right-6 z-20">
        <Button onClick={toggleLanguage} variant="outline" className="bg-black/40 border-white/10 text-slate-200 hover:bg-white/5 rounded-full">
          <Globe className="h-4 w-4 mr-2" />
          <span className="text-xs font-black tracking-widest uppercase">{currentLang === "en" ? "MY" : "EN"}</span>
        </Button>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-28 w-28 rounded-2xl bg-black/40 border border-white/10 grid place-items-center overflow-hidden shadow-2xl">
              <img src="/logo.png" alt="Britium" className="h-20 w-20 object-contain" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">{brand.title}</h1>
            <p className="text-sm text-slate-300">{t(brand.subtitleEn, brand.subtitleMy)}</p>
            <p className="text-xs text-slate-400">{t(brand.hintEn, brand.hintMy)}</p>
          </div>

          {configMissing ? (
            <Card className="bg-[#0B101B]/85 backdrop-blur-xl border-white/10 rounded-[1.75rem] overflow-hidden shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-rose-400">
                  <AlertCircle className="h-5 w-5" />
                  {t("System Configuration Required", "System Config လိုအပ်သည်")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-300">
                  {t("Supabase environment variables are missing. Set them and redeploy.", "Supabase env var မရှိသေးပါ။ ထည့်ပြီး redeploy လုပ်ပါ။")}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-[#0B101B]/85 backdrop-blur-xl border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-400" />
              <CardContent className="p-7 md:p-8 space-y-5">
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <div className="font-extrabold uppercase tracking-widest text-sm">{pageTitle}</div>
                  </div>
                  {view !== "login" && (
                    <Button variant="ghost" className="text-slate-300 hover:bg-white/5" onClick={() => { clearMessages(); setView("login"); }}>
                      <ArrowLeft className="h-4 w-4 mr-2" /> {t("Back", "နောက်သို့")}
                    </Button>
                  )}
                </div>

                {view === "login" && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12 focus:border-emerald-500/40" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12 focus:border-emerald-500/40" placeholder={t("Password", "စကားဝှက်")} />
                    </div>
                    <div className="flex items-center justify-between px-1">
                      <button type="button" onClick={() => { clearMessages(); setView("forgot"); }} className="text-[11px] text-slate-400 hover:text-emerald-300 font-bold uppercase tracking-widest">
                        {t("Forgot Password?", "စကားဝှက် မေ့နေပါသလား?")}
                      </button>
                      <button type="button" onClick={() => { clearMessages(); setView("request"); }} className="text-[11px] text-[#D4AF37] hover:text-[#b5952f] font-bold uppercase tracking-widest flex items-center gap-2">
                        <UserPlus className="h-4 w-4" /> {t("Sign Up", "အကောင့်လုပ်မည်")}
                      </button>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl mt-2">
                      {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Authenticating…", "စစ်ဆေးနေသည်…")}</span> : <span className="flex items-center justify-center gap-2">{t("Login", "အကောင့်ဝင်မည်")} <ArrowRight className="h-4 w-4" /></span>}
                    </Button>
                  </form>
                )}

                {view === "forgot" && (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div className="text-sm text-slate-300">{t("Enter your email to receive a secure recovery link.", "Recovery link ရယူရန် အီးမေးလ်ထည့်ပါ။")}</div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("Corporate Email", "အီးမေးလ်")} />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-700 hover:bg-slate-600 text-white font-black tracking-widest uppercase rounded-xl">
                      {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Sending…", "ပို့နေသည်…")}</span> : t("Send Recovery Link", "Recovery Link ပို့မည်")}
                    </Button>
                  </form>
                )}

                {view === "request" && (
                  <form onSubmit={handleRequestAccess} className="space-y-4">
                    <div className="text-sm text-slate-300">{t("This platform is for authorized personnel. Submit a request to create an account.", "ဤစနစ်သည် ခွင့်ပြုထားသူများအတွက် ဖြစ်သည်။ အကောင့်ဖန်တီးရန် request တင်ပါ။")}</div>
                    <div className="relative">
                      <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("Work Email", "အလုပ်အီးမေးလ်")} />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("New Password", "စကားဝှက်အသစ်")} />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-[#D4AF37] hover:bg-[#b5952f] text-black font-black tracking-widest uppercase rounded-xl">
                      {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Submitting…", "တင်နေသည်…")}</span> : t("Submit Request", "Request တင်မည်")}
                    </Button>
                  </form>
                )}

                {view === "force_change" && (
                  <form onSubmit={handleForceChange} className="space-y-4">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm">
                      {t("A password update is required before access is granted.", "ဝင်ရောက်ခွင့်မပြုမီ စကားဝှက်အသစ်ပြောင်းရန် လိုအပ်ပါသည်။")}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-black/40 border-amber-500/30 text-white h-12 rounded-xl pl-12" placeholder={t("New Password", "စကားဝှက်အသစ်")} />
                    </div>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                      <Input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="bg-black/40 border-amber-500/30 text-white h-12 rounded-xl pl-12" placeholder={t("Confirm Password", "စကားဝှက် အတည်ပြုပါ")} />
                    </div>
                    <Button type="submit" disabled={loading} className="w-full h-12 bg-amber-600 hover:bg-amber-500 text-white font-black tracking-widest uppercase rounded-xl">
                      {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Updating…", "ပြောင်းနေသည်…")}</span> : <span className="flex items-center justify-center gap-2">{t("Update & Continue", "ပြောင်းပြီး ဆက်သွားမည်")} <ArrowRight className="h-4 w-4" /></span>}
                    </Button>
                  </form>
                )}

                {view === "mfa" && (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-300">{t("Admin accounts require MFA. Use an authenticator app (Google Authenticator / Microsoft Authenticator).", "Admin အကောင့်များသည် MFA လိုအပ်ပါသည်။ Authenticator app အသုံးပြုပါ။")}</div>
                    {mfaStage === "enroll" && (
                      <div className="space-y-3">
                        {mfaQrSvg && (
                          <div className="rounded-xl border border-white/10 bg-black/40 p-3">
                            <div className="text-xs text-slate-300 mb-2">{t("Scan this QR code:", "ဒီ QR ကို စကန်ပါ:")}</div>
                            <div className="bg-white rounded-lg p-2 overflow-auto" dangerouslySetInnerHTML={{ __html: mfaQrSvg }} />
                          </div>
                        )}
                        {mfaSecret && (
                          <div className="rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-slate-300">
                            <div className="font-bold">{t("Manual key:", "Manual key:")}</div>
                            <div className="font-mono break-all">{mfaSecret}</div>
                            <div className="mt-2 flex gap-2 flex-wrap">
                              <Button size="sm" variant="outline" className="border-white/10 bg-black/40 hover:bg-white/5" onClick={() => navigator.clipboard.writeText(mfaSecret)}><Copy className="h-3 w-3 mr-2" /> {t("Copy", "ကူးယူ")}</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <form onSubmit={verifyMfa} className="space-y-3">
                      <Input inputMode="numeric" pattern="\d*" value={otp} onChange={(e) => setOtp(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl" placeholder={t("6-digit code", "Code ၆ လုံး")} />
                      <div className="flex gap-2 flex-wrap">
                        <Button type="submit" disabled={loading || !mfaFactorId || !mfaChallengeId} className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl">
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t("Verify", "အတည်ပြု")}
                        </Button>
                        <Button type="button" variant="outline" disabled={loading} className="border-white/10 bg-black/40 hover:bg-white/5 text-slate-200 rounded-xl" onClick={() => prepareMfa()}>
                          <RefreshCw className="h-4 w-4 mr-2" /> {t("Restart MFA", "MFA ပြန်စ")}
                        </Button>
                        <Button type="button" variant="ghost" className="text-slate-300 hover:bg-white/5 rounded-xl" onClick={async () => { await supabase.auth.signOut(); setView("login"); }}>
                          {t("Logout", "ထွက်မည်")}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
                <Separator className="bg-white/10" />
                <div className="text-[11px] text-slate-400 leading-relaxed text-center font-mono">
                  {t("Security Notice: Authorized personnel only. Activity may be monitored.", "လုံခြုံရေးသတိပေးချက်: ခွင့်ပြုထားသူများသာ။ လုပ်ဆောင်မှုများကို စောင့်ကြည့်နိုင်သည်။")}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
