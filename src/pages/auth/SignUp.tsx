import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { Globe, Loader2, ArrowLeft, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

export default function SignUp() {
  const navigate = useNavigate();
  const langCtx = useLanguage?.() ?? {};
  const lang = langCtx.lang ?? langCtx.language ?? "en";
  const setLang =
    langCtx.setLang ??
    langCtx.setLanguage ??
    (() => {});

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const t = (en: string, my: string) => (lang === "en" ? en : my);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error(t("Full name is required.", "အမည်အပြည့်အစုံ လိုအပ်ပါသည်။"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("Password must be at least 6 characters.", "စကားဝှက် အနည်းဆုံး ၆ လုံး ရှိရပါမည်။"));
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data?.user?.id) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          email,
          role: "USER",
          requires_password_change: false,
        });
      }

      toast.success(
        t(
          "Account created. Please check your email if confirmation is enabled.",
          "အကောင့်ဖွင့်ပြီးပါပြီ။ Email အတည်ပြုခြင်းဖွင့်ထားပါက သင့် email ကို စစ်ဆေးပါ။"
        )
      );
      navigate("/");
    } catch (error: any) {
      toast.error(error?.message || t("Sign up failed.", "အကောင့်ဖွင့်ခြင်း မအောင်မြင်ပါ။"));
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
            {t("Create Account", "အကောင့်ဖွင့်ရန်")}
          </h2>
          <p className="mb-8 text-center text-sm text-gray-300">
            {t("Register a new portal account", "Portal အကောင့်အသစ် ဖွင့်ရန်")}
          </p>

          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="text"
              placeholder={t("FULL NAME", "အမည်အပြည့်အစုံ")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white outline-none placeholder:text-gray-500 focus:border-emerald-500"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <input
              type="email"
              placeholder={t("EMAIL", "အီးမေးလ်")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white outline-none placeholder:text-gray-500 focus:border-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder={t("PASSWORD", "စကားဝှက်")}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono text-white outline-none placeholder:text-gray-500 focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-500 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={16} />}
              {loading ? t("Creating...", "ဖန်တီးနေသည်...") : t("Create Account", "အကောင့်ဖွင့်မည်")}
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
