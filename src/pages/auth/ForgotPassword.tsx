import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { Globe, Loader2, ArrowLeft, KeyRound } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const lang = langCtx.lang ?? langCtx.language ?? "en";
  const setLang =
    langCtx.setLang ??
    langCtx.setLanguage ??
    (() => {});

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) throw error;

      toast.success(
        t(
          "Reset link sent. Please check your email.",
          "Reset link ပို့ပြီးပါပြီ။ သင့် email ကို စစ်ဆေးပါ။"
        )
      );
    } catch (error: any) {
      toast.error(
        error?.message || t("Could not send reset email.", "Reset email မပို့နိုင်ပါ။")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="auto">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617]/80 via-[#05080F]/70 to-[#0B101B]/85" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-[2.5rem] border border-white/10 bg-[#0B101B]/75 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex justify-center">
            <img src="/logo.png" alt="Logo" className="h-24 w-24 object-contain" />
          </div>

          <h2 className="mb-2 text-center text-xl font-black uppercase tracking-[0.3em] text-white">
            {t("Forgot Password", "စကားဝှက်မေ့နေသည်")}
          </h2>
          <p className="mb-8 text-center text-sm text-gray-300">
            {t(
              "Enter your email to receive a reset link",
              "Reset link လက်ခံရန် သင့် email ကို ထည့်ပါ"
            )}
          </p>

          <form onSubmit={handleReset} className="space-y-4">
            <input
              type="email"
              placeholder={t("EMAIL", "အီးမေးလ်")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white outline-none placeholder:text-gray-500 focus:border-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-amber-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" /> : <KeyRound size={16} />}
              {loading ? t("Sending...", "ပို့နေသည်...") : t("Send Reset Link", "Reset Link ပို့မည်")}
            </button>
          </form>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-bold uppercase text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={14} />
              {t("Back to Login", "အကောင့်ဝင်ရန် ပြန်သွားမည်")}
            </button>

            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "my" : "en")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-bold uppercase text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <Globe size={14} />
              {lang === "en" ? "Myanmar" : "English"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
