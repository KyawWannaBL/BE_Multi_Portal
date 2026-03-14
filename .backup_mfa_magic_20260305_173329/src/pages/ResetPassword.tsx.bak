// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase, isSupabaseConfigured } from "@/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, Lock, ArrowRight, Globe } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { lang, toggleLang, setLanguage } = useLanguage();

  const [currentLang, setCurrentLang] = useState(lang || "en");
  const t = (en: string, my: string) => (currentLang === "en" ? en : my);

  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (lang) setCurrentLang(lang);
  }, [lang]);

  const toggleLanguage = () => {
    const next = currentLang === "en" ? "my" : "en";
    setCurrentLang(next);
    if (typeof setLanguage === "function") setLanguage(next);
    else if (typeof toggleLang === "function") toggleLang();
  };

  const configMissing = useMemo(() => !isSupabaseConfigured, []);

  useEffect(() => {
    (async () => {
      if (configMissing) return;

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code && supabase.auth.exchangeCodeForSession) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data } = await supabase.auth.getSession();
        if (!data?.session) {
          setErrorMsg(
            t(
              "No active reset session. Please request a new reset link.",
              "Reset session မရှိပါ။ Reset link ကို ပြန်တောင်းပါ။"
            )
          );
        } else {
          setReady(true);
        }
      } catch (e: any) {
        setErrorMsg(e?.message || t("Unable to initialize reset.", "Reset စတင်မရပါ။"));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configMissing]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (configMissing) {
      setErrorMsg(t("System configuration missing (Supabase env).", "System config မပြည့်စုံပါ (Supabase env)."));
      return;
    }

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

      const uid = data?.user?.id;
      if (uid) {
        try { await supabase.from("profiles").update({ must_change_password: false }).eq("id", uid); } catch {}
        try { await supabase.from("profiles").update({ requires_password_change: false }).eq("id", uid); } catch {}
      }

      setSuccessMsg(t("Password updated. Redirecting to login…", "စကားဝှက် ပြောင်းပြီးပါပြီ။ Login သို့ ပြန်သွားနေသည်…"));
      setTimeout(() => navigate("/login", { replace: true }), 900);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Password update failed.", "စကားဝှက်ပြောင်းမရပါ။"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#05080F] text-slate-100 p-4">
      <div className="absolute top-6 right-6 z-20">
        <Button onClick={toggleLanguage} variant="outline" className="bg-black/40 border-white/10 text-slate-200 hover:bg-white/5 rounded-full px-4">
          <Globe className="w-4 h-4 mr-2" />
          <span className="font-black tracking-widest uppercase">{currentLang === "en" ? "MY" : "EN"}</span>
        </Button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="bg-[#111622]/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-400" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-emerald-400" />
              {t("Reset Password", "စကားဝှက် ပြန်သတ်မှတ်")}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-7 space-y-5">
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

            {configMissing ? (
              <div className="text-sm text-slate-300">
                {t("Supabase env is missing. Set env and redeploy.", "Supabase env မရှိပါ။ env ထည့်ပြီး redeploy လုပ်ပါ။")}
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white"
                    placeholder={t("New Password", "စကားဝှက်အသစ်")}
                    disabled={!ready}
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-[#0B0E17] border border-white/10 rounded-xl pl-12 h-12 text-white"
                    placeholder={t("Confirm Password", "စကားဝှက် အတည်ပြုပါ")}
                    disabled={!ready}
                  />
                </div>

                <Button type="submit" disabled={loading || !ready} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("Updating…", "ပြောင်းနေသည်…")}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {t("Update Password", "စကားဝှက် ပြောင်းမည်")}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <div className="text-center mt-5 text-[11px] text-slate-500">© {new Date().getFullYear()} Britium Enterprise</div>
      </div>
    </div>
  );
}
