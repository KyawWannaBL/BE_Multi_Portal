// @ts-nocheck
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase, SUPABASE_CONFIGURED } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Globe, Loader2, Lock, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
  const nav = useNavigate();
  const { lang, setLanguage, toggleLang } = useLanguage();
  const [currentLang, setCurrentLang] = useState(lang || "en");
  const t = (en: string, my: string) => (currentLang === "en" ? en : my);

  const [loading, setLoading] = useState(true);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => { if (lang) setCurrentLang(lang); }, [lang]);
  const toggleLanguage = () => {
    const next = currentLang === "en" ? "my" : "en";
    setCurrentLang(next);
    if (typeof setLanguage === "function") setLanguage(next);
    else if (typeof toggleLang === "function") toggleLang();
  };

  useEffect(() => {
    (async () => {
      if (!SUPABASE_CONFIGURED) { setLoading(false); return; }
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        if (code && supabase.auth.exchangeCodeForSession) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          setLoading(false); return;
        }
        const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token && supabase.auth.setSession) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;
        }
        setLoading(false);
      } catch (e: any) {
        setErrorMsg(e?.message || t("Invalid or expired recovery link.", "Recovery link မမှန် သို့မဟုတ် သက်တမ်းကုန်နေပါသည်။"));
        setLoading(false);
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(""); setSuccessMsg("");
    if (!SUPABASE_CONFIGURED) return setErrorMsg("System config missing.");
    if (pw !== pw2) return setErrorMsg(t("Passwords do not match.", "စကားဝှက်များ မကိုက်ညီပါ။"));
    if (pw.length < 8) return setErrorMsg(t("Password must be at least 8 characters.", "စကားဝှက်သည် အနည်းဆုံး ၈ လုံး ဖြစ်ရမည်။"));

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.id) {
          await supabase.from("profiles").update({ must_change_password: false, requires_password_change: false }).eq("id", data.user.id);
        }
      } catch {}
      setSuccessMsg(t("Password updated. Please login.", "စကားဝှက် ပြောင်းပြီးပါပြီ။ Login ပြန်ဝင်ပါ။"));
      setTimeout(() => nav("/login", { replace: true }), 900);
    } catch (e: any) {
      setErrorMsg(e?.message || t("Password update failed.", "စကားဝှက်ပြောင်းမရပါ။"));
    } finally { setLoading(false); }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05080F] text-slate-100">
      <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none grayscale">
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
            <h1 className="text-3xl font-black tracking-tight">BRITIUM</h1>
            <p className="text-sm text-slate-300">{t("Reset password", "စကားဝှက် ပြန်လည်သတ်မှတ်")}</p>

            <Button variant="ghost" className="text-slate-300 hover:bg-white/5 mt-2" onClick={() => nav("/login")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("Back to Login", "Login သို့ပြန်")}
            </Button>
          </div>

          <Card className="bg-[#0B101B]/85 backdrop-blur-xl border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-600 to-teal-400" />
            <CardContent className="p-7 space-y-4">
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
              {loading ? (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-300 py-8">
                  <Loader2 className="h-4 w-4 animate-spin" /> {t("Preparing secure session…", "လုံခြုံရေး session ကို ပြင်ဆင်နေသည်…")}
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("New Password", "စကားဝှက်အသစ်")} />
                  </div>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <Input type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} className="bg-black/40 border-white/10 text-white h-12 rounded-xl pl-12" placeholder={t("Confirm Password", "စကားဝှက် အတည်ပြု")} />
                  </div>
                  <Button disabled={loading} type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black tracking-widest uppercase rounded-xl mt-4">
                    {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> {t("Updating…", "ပြောင်းနေသည်…")}</span> : t("Update Password", "စကားဝှက် ပြောင်းမည်")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
