import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase, SUPABASE_CONFIGURED } from "@/supabaseClient";
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
  Terminal
} from "lucide-react";

// --- Types & Interfaces ---
type View = "login" | "forgot" | "request" | "force_change" | "mfa";
type MfaStage = "idle" | "enroll" | "verify";

interface LocationState {
  from?: string;
  reason?: string;
}

interface ProfileData {
  id?: string;
  role?: string;
  role_code?: string;
  app_role?: string;
  user_role?: string;
  must_change_password?: boolean;
  requires_password_change?: boolean;
}

// --- Constants ---
const MFA_REQUIRED_ROLES = new Set(["SYS", "APP_OWNER", "SUPER_ADMIN", "SUPER_A", "ADM", "MGR", "ADMIN"]);
const EXEC_ROLES = new Set(["RIDER", "DRIVER", "HELPER"]);
const FIN_ROLES = new Set(["FINANCE_USER", "FINANCE_STAFF", "FINANCE_ADMIN", "ACCOUNTANT"]);
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

// --- Helper Functions ---
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unexpected error occurred.";
}

function normRole(role?: string | null): string {
  const r = (role ?? "").trim().toUpperCase();
  if (!r) return "GUEST";
  return r === "SUPER_A" ? "SUPER_ADMIN" : r;
}

function pathForRole(role?: string | null): string {
  const r = normRole(role);
  if (FIN_ROLES.has(r)) return "/portal/finance";
  if (OPS_ROLES.has(r)) return "/portal/operations";
  if (EXEC_ROLES.has(r)) return "/portal/execution";
  return "/portal/operations";
}

function supabaseReady(): boolean {
  return Boolean(SUPABASE_CONFIGURED);
}

function readEnvHints(): string {
  return [
    "Required environment variables (Vite):",
    "  VITE_SUPABASE_URL=https://dltavabvjwocknkyvwgz.supabase.co",
    "  VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsdGF2YWJ2andvY2tua3l2d2d6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTExMzE5NCwiZXhwIjoyMDg2Njg5MTk0fQ.ckX1XXGgKPzD3IBW6yG2iG2RGfkQXyjE9IQbQZMMymA",
"",
    "Notes:",
    "  - Must be set at build time (redeploy after setting in hosting).",
    "  - For local dev, use .env.local.",
  ].join("\n");
}

async function loadProfile(userId: string): Promise<{ role: string; mustChange: boolean }> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, role, role_code, app_role, user_role, must_change_password, requires_password_change")
      .eq("id", userId)
      .maybeSingle();

    // Fallback for schema drift
    if (error && error.code === "42703") {
      const fallback = await supabase
        .from("profiles")
        .select("id, role, must_change_password")
        .eq("id", userId)
        .maybeSingle();

      if (fallback.error) return { role: "GUEST", mustChange: false };
      
      const row = (fallback.data as ProfileData) || {};
      const rawRole = row.role || "GUEST";
      const mustChange = Boolean(row.must_change_password);
      return { role: normRole(rawRole), mustChange };
    }

    if (error) return { role: "GUEST", mustChange: false };

    const row = (data as ProfileData) || {};
    const rawRole = row.role ?? row.app_role ?? row.user_role ?? row.role_code ?? "GUEST";
    const mustChange = Boolean(row.must_change_password) || Boolean(row.requires_password_change);
    return { role: normRole(rawRole), mustChange };
  } catch {
    return { role: "GUEST", mustChange: false };
  }
}

async function hasAal2(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) return false;
    return data?.currentLevel === "aal2";
  } catch {
    return false;
  }
}

// --- Main Component ---
export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const locState = loc.state as LocationState | null;
  const auth = useAuth();

  const { lang, setLanguage, toggleLang } = useLanguage();
  const [currentLang, setCurrentLang] = useState<string>(lang || "en");
  const t = (en: string, my: string) => (currentLang === "en" ? en : my);

  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState<boolean>(false);
  const [configMissing, setConfigMissing] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [targetPath, setTargetPath] = useState<string>("/");

  // MFA state
  const [mfaStage, setMfaStage] = useState<MfaStage>("idle");
  const [mfaFactorId, setMfaFactorId] = useState<string>("");
  const [mfaChallengeId, setMfaChallengeId] = useState<string>("");
  const [mfaQrSvg, setMfaQrSvg] = useState<string>("");
  const [mfaSecret, setMfaSecret] = useState<string>("");
  const [mfaUri, setMfaUri] = useState<string>("");

  useEffect(() => {
    if (lang) setCurrentLang(lang);
  }, [lang]);

  const toggleLanguage = () => {
    const next = currentLang === "en" ? "my" : "en";
    setCurrentLang(next);
    if (typeof setLanguage === "function") setLanguage(next);
    else if (typeof toggleLang === "function") toggleLang();
  };

  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  async function goAfterAuth(role?: string) {
    const from = locState?.from;
    const dst = (typeof from === "string" && from.startsWith("/")) ? from : pathForRole(role);
    setTargetPath(dst);
    nav(dst, { replace: true });
  }

  async function ensureMfa(role?: string): Promise<boolean> {
    const r = normRole(role);
    if (!MFA_REQUIRED_ROLES.has(r)) return true;

    const ok = await hasAal2();
    if (ok) return true;

    setView("mfa");
    await prepareMfa();
    return false;
  }

  async function prepareMfa() {
    setMfaStage("idle");
    setOtp("");
    setMfaQrSvg("");
    setMfaSecret("");
    setMfaUri("");
    setMfaFactorId("");
    setMfaChallengeId("");

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const totpFactors = (data?.totp || data?.all || []);
      const verified = totpFactors.find((f: any) => (f?.status || "").toLowerCase() === "verified") || totpFactors[0];

      if (verified?.id) {
        const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: verified.id });
        if (chErr) throw chErr;

        setMfaFactorId(verified.id);
        setMfaChallengeId(ch?.id || "");
        setMfaStage("verify");
        setSuccessMsg(t("Enter your 6-digit authenticator code.", "Authenticator code (၆ လုံး) ကို ထည့်ပါ။"));
        return;
      }

      const { data: enr, error: enrErr } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (enrErr) throw enrErr;

      setMfaFactorId(enr?.id || "");
      setMfaQrSvg(enr?.totp?.qr_code || "");
      setMfaSecret(enr?.totp?.secret || "");
      setMfaUri(enr?.totp?.uri || "");

      const { data: ch2, error: ch2Err } = await supabase.auth.mfa.challenge({ factorId: enr.id });
      if (ch2Err) throw ch2Err;

      setMfaChallengeId(ch2?.id || "");
      setMfaStage("enroll");
      setSuccessMsg(t("Scan QR with authenticator app, then enter the code.", "Authenticator နဲ့ QR စကန်ပြီး code ထည့်ပါ။"));
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error));
      setMfaStage("idle");
    } finally {
      setLoading(false);
    }
  }

  async function verifyMfa(e: React.FormEvent) {
    e.preventDefault();
    clearMessages();

    if (!otp || otp.trim().length < 6) {
      setErrorMsg(t("Enter the 6-digit code.", "Code ၆ လုံး ထည့်ပါ။"));
      return;
    }

    setLoading(true);
    try {
      const code = otp.trim().replace(/\s+/g, "");
      const { error } = await supabase.auth.mfa.verify({
        factorId: mfaFactorId,
        challengeId: mfaChallengeId,
        code,
      });
      if (error) throw error;

      const ok = await hasAal2();
      if (!ok) throw new Error("MFA verification incomplete (AAL2 not reached).");

      setSuccessMsg(t("MFA verified. Redirecting…", "MFA အောင်မြင်ပါပြီ။ ဆက်သွားနေသည်…"));
      setTimeout(() => nav(targetPath || "/", { replace: true }), 400);
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error) || t("Invalid code.", "Code မမှန်ပါ။"));
    } finally {
      setLoading(false);
    }
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
        const from = locState?.from;
        const dst = (typeof from === "string" && from.startsWith("/")) ? from : pathForRole(prof.role);
        setTargetPath(dst);

        if (prof.mustChange) {
          setView("force_change");
          return;
        }

        const need = MFA_REQUIRED_ROLES.has(normRole(prof.role));
        if (need) {
          const okAal = await hasAal2();
          if (!okAal) {
            setView("mfa");
            await prepareMfa();
            return;
          }
        }

        nav(dst, { replace: true });
      } catch {
        // Silently ignore session fetch errors on initial mount
      }
    })();
  }, [locState, nav]);

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

      await auth.refresh();

      const prof = await loadProfile(data.user.id);
      const from = locState?.from;
      const dst = (typeof from === "string" && from.startsWith("/")) ? from : pathForRole(prof.role);
      setTargetPath(dst);

      if (prof.mustChange) {
        setView("force_change");
        setLoading(false);
        return;
      }

      const passed = await ensureMfa(prof.role);
      if (!passed) {
        setLoading(false);
        return;
      }

      await goAfterAuth(prof.role);
    } catch (error: unknown) {
      setErrorMsg("ACCESS DENIED: INVALID CREDENTIALS"); // Using terminal style error
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
      
      setSuccessMsg(t("Recovery link sent. Please check your email.", "Recovery link ကို ပို့ပြီးပါပြီ။ အီးမေးလ်ကို စစ်ပါ။"));
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error));
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
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      setSuccessMsg(t("Request submitted. Please verify your email if prompted.", "Request တင်ပြီးပါပြီ။ လိုအပ်ပါက အီးမေးလ်အတည်ပြုပါ။"));
      setTimeout(() => setView("login"), 900);
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error));
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

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      if (data?.user?.id) {
        try {
          await supabase
            .from("profiles")
            .update({ must_change_password: false, requires_password_change: false })
            .eq("id", data.user.id);
        } catch {
          // Ignore profile update errors if auth update succeeded
        }
      }

      await auth.refresh();
      const prof = await loadProfile(data.user.id);

      const passed = await ensureMfa(prof.role);
      if (!passed) {
        setLoading(false);
        return;
      }

      setSuccessMsg(t("Password updated. Redirecting…", "စကားဝှက် ပြောင်းပြီးပါပြီ။ ဆက်သွားနေသည်…"));
      setTimeout(() => goAfterAuth(prof.role), 450);
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const pageTitle = useMemo(() => {
    if (view === "forgot") return t("Password Recovery", "စကားဝှက် ပြန်လည်ရယူခြင်း");
    if (view === "request") return t("Request Access", "ဝင်ရောက်ခွင့် တောင်းမည်");
    if (view === "force_change") return t("Security Update", "လုံခြုံရေး အပ်ဒိတ် လိုအပ်");
    if (view === "mfa") return t("MFA Verification", "အဆင့်မြင့် အတည်ပြုခြင်း (MFA)");
    return t("Terminal Login", "အကောင့်ဝင်မည်");
  }, [view, currentLang]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0A0F1C] text-slate-100">
      
      {/* 🖼️ BACKGROUND VIDEO OVERLAY */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0A0F1C]/80 via-[#0A0F1C]/95 to-[#0A0F1C] pointer-events-none"></div>
      <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-screen pointer-events-none">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {/* LANGUAGE TOGGLE */}
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={toggleLanguage} 
          className="flex items-center gap-2 px-4 py-2 bg-[#0E1525] border border-white/5 text-gray-400 hover:text-white rounded-full transition-colors"
        >
          <Globe className="h-4 w-4" />
          <span className="text-[10px] font-black tracking-widest uppercase">{currentLang === "en" ? "MY" : "EN"}</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-[420px] p-6 flex flex-col items-center">
        
        {/* LOGO */}
        <div className="w-16 h-16 rounded-full bg-[#0E1525] border border-white/5 shadow-2xl flex items-center justify-center mb-6 relative overflow-hidden">
           <img src="/logo.png" alt="Britium" className="h-10 w-10 object-contain relative z-10" />
           <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
        </div>

        {/* HEADERS */}
        <div className="text-center mb-10">
          <h1 className="text-[32px] font-black text-white italic tracking-wide uppercase drop-shadow-lg mb-1">
            {pageTitle}
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#059669] uppercase">
            Britium Secure Core
          </p>
        </div>

        {configMissing ? (
          /* CONFIG MISSING TERMINAL CARD */
          <div className="w-full relative bg-[#0D121F] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-600 via-rose-400 to-rose-600"></div>
            <div className="p-8 space-y-6 mt-2">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertCircle className="h-6 w-6" />
                <h2 className="text-sm font-bold tracking-widest uppercase">System Config Missing</h2>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {t("Supabase environment variables are missing. Set them and redeploy.", "Supabase env var မရှိသေးပါ။ ထည့်ပြီး redeploy လုပ်ပါ။")}
              </p>
              <pre className="text-[10px] whitespace-pre-wrap rounded-xl border border-white/5 bg-[#0A0F1C] p-4 text-gray-500 font-mono overflow-x-auto">
                {readEnvHints()}
              </pre>
              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-[#0A0F1C] border border-white/5 hover:border-gray-500 text-gray-400 font-bold text-[10px] tracking-widest uppercase rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
                  onClick={() => navigator.clipboard.writeText(readEnvHints())}
                >
                  <Copy className="h-3 w-3" /> {t("Copy", "ကူးယူ")}
                </button>
                <button 
                  className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-bold text-[10px] tracking-widest uppercase rounded-xl py-3 flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-3 w-3" /> {t("Reload", "ပြန်ဖွင့်")}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN TERMINAL CARD */
          <div className="w-full relative bg-[#0D121F] rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#059669] via-teal-400 to-[#059669]"></div>

            <div className="p-8 space-y-8 mt-2">
              
              {/* MESSAGES */}
              {errorMsg && (
                <div className="p-4 bg-[#2A080A] rounded-xl border border-red-900/50 flex items-center justify-center">
                  <p className="text-[#F43F5E] text-[10px] font-bold tracking-widest italic uppercase text-center leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              )}

              {successMsg && (
                <div className="p-4 bg-emerald-900/20 rounded-xl border border-emerald-900/50 flex items-center justify-center">
                  <p className="text-emerald-400 text-[10px] font-bold tracking-widest italic uppercase text-center leading-relaxed">
                    {successMsg}
                  </p>
                </div>
              )}

              {/* BACK BUTTON */}
              {view !== "login" && (
                <button
                  onClick={() => { clearMessages(); setView("login"); }}
                  className="text-[10px] font-bold tracking-widest text-gray-500 hover:text-white uppercase flex items-center gap-2 transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" /> {t("Back to Terminal", "နောက်သို့")}
                </button>
              )}

              {/* LOGIN VIEW */}
              {view === "login" && (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-2">Authorized ID</label>
                    <div className="relative flex items-center group">
                      <Mail className="absolute left-5 w-4 h-4 text-gray-500 group-focus-within:text-[#059669] transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#0A0F1C] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#059669] outline-none transition-colors placeholder:text-gray-600"
                        placeholder="identity@britiumexpress.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-2">Access Token</label>
                    <div className="relative flex items-center group">
                      <Lock className="absolute left-5 w-4 h-4 text-gray-500 group-focus-within:text-[#059669] transition-colors" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-[#0A0F1C] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#059669] outline-none transition-colors placeholder:text-gray-600"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold text-[12px] tracking-[0.15em] uppercase rounded-2xl py-5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-[0_0_15px_rgba(5,150,105,0.4)] hover:shadow-[0_0_25px_rgba(5,150,105,0.6)]"
                  >
                    {loading ? t("VERIFYING...", "စစ်ဆေးနေသည်...") : t("VERIFY IDENTITY", "အတည်ပြုမည်")}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}

              {/* FORGOT PASSWORD VIEW */}
              {view === "forgot" && (
                <form onSubmit={handleForgot} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-2">Authorized ID</label>
                    <div className="relative flex items-center group">
                      <Mail className="absolute left-5 w-4 h-4 text-gray-500 group-focus-within:text-[#059669] transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#0A0F1C] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#059669] outline-none transition-colors placeholder:text-gray-600"
                        placeholder="identity@britiumexpress.com"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold text-[12px] tracking-[0.15em] uppercase rounded-2xl py-5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("SEND RECOVERY LINK", "Recovery Link ပို့မည်")}
                  </button>
                </form>
              )}

              {/* REQUEST ACCESS VIEW */}
              {view === "request" && (
                <form onSubmit={handleRequestAccess} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-2">Work Email</label>
                    <div className="relative flex items-center group">
                      <Mail className="absolute left-5 w-4 h-4 text-gray-500 group-focus-within:text-[#059669] transition-colors" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#0A0F1C] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#059669] outline-none transition-colors"
                        placeholder="staff@britiumexpress.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase ml-2">New Password</label>
                    <div className="relative flex items-center group">
                      <Lock className="absolute left-5 w-4 h-4 text-gray-500 group-focus-within:text-[#059669] transition-colors" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-[#0A0F1C] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#059669] outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email || !password}
                    className="w-full bg-[#D4AF37] hover:bg-[#b5952f] text-black font-bold text-[12px] tracking-[0.15em] uppercase rounded-2xl py-5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("SUBMIT REQUEST", "Request တင်မည်")}
                  </button>
                </form>
              )}

              {/* FORCE CHANGE PASSWORD VIEW */}
              {view === "force_change" && (
                <form onSubmit={handleForceChange} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-widest text-amber-500 uppercase ml-2">New Secure Token</label>
                    <div className="relative flex items-center group">
                      <Lock className="absolute left-5 w-4 h-4 text-amber-500" />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full bg-[#0A0F1C] border border-amber-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-amber-500 outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold tracking-widest text-amber-500 uppercase ml-2">Confirm Token</label>
                    <div className="relative flex items-center group">
                      <CheckCircle2 className="absolute left-5 w-4 h-4 text-amber-500" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full bg-[#0A0F1C] border border-amber-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-amber-500 outline-none transition-colors"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-[12px] tracking-[0.15em] uppercase rounded-2xl py-5 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 shadow-[0_0_15px_rgba(217,119,6,0.4)]"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("UPDATE & CONTINUE", "ပြောင်းပြီး ဆက်သွားမည်")}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              )}

              {/* MFA VIEW */}
              {view === "mfa" && (
                <div className="space-y-6">
                  {mfaStage === "enroll" && (
                    <div className="space-y-4">
                      {mfaQrSvg && (
                        <div className="rounded-2xl border border-white/5 bg-[#0A0F1C] p-4 flex flex-col items-center">
                          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">Scan Authenticator QR</p>
                          <div className="bg-white rounded-xl p-3 inline-block" dangerouslySetInnerHTML={{ __html: mfaQrSvg }} />
                        </div>
                      )}
                      {mfaSecret && (
                        <div className="rounded-2xl border border-white/5 bg-[#0A0F1C] p-4">
                          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">Manual Setup Key</p>
                          <div className="font-mono text-sm text-emerald-400 break-all bg-black/50 p-3 rounded-lg border border-white/5">{mfaSecret}</div>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={verifyMfa} className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase ml-2">6-Digit Auth Code</label>
                      <div className="relative flex items-center group">
                        <Terminal className="absolute left-5 w-4 h-4 text-emerald-500" />
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="\d*"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-[#0A0F1C] border border-emerald-500/30 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-colors tracking-[0.5em] font-mono"
                          placeholder="000000"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                      <button
                        type="submit"
                        disabled={loading || !mfaFactorId || !mfaChallengeId || otp.length < 6}
                        className="w-full bg-[#059669] hover:bg-[#047857] text-white font-bold text-[12px] tracking-[0.15em] uppercase rounded-2xl py-4 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-[0_0_15px_rgba(5,150,105,0.4)]"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("VERIFY MFA TOKEN", "အတည်ပြု")}
                      </button>
                      <button
                        type="button"
                        onClick={() => prepareMfa()}
                        disabled={loading}
                        className="w-full bg-[#0A0F1C] border border-white/5 hover:border-gray-500 text-gray-400 font-bold text-[10px] tracking-[0.15em] uppercase rounded-2xl py-4 transition-all flex items-center justify-center gap-3"
                      >
                        <RefreshCw className="h-3 w-3" /> {t("RESTART MFA", "MFA ပြန်စ")}
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

        {/* FOOTER LINKS (Only show on main login) */}
        {!configMissing && view === "login" && (
          <div className="w-full mt-6 flex justify-between items-center px-4">
            <button
              onClick={() => { clearMessages(); setView("forgot"); }}
              className="text-[10px] font-bold tracking-widest text-gray-600 hover:text-white transition-colors uppercase"
            >
              {t("Issue Credentials?", "စကားဝှက် မေ့နေပါသလား?")}
            </button>
            <button
              onClick={() => { clearMessages(); setView("request"); }}
              className="text-[10px] font-bold tracking-widest text-gray-600 hover:text-white transition-colors uppercase"
            >
              {t("Request Access", "ဝင်ရောက်ခွင့် တောင်းမည်")}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}