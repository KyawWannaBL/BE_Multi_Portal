import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function PortalShell({
  title,
  links,
  prevTo,
  nextTo,
  children,
}: {
  title: string;
  links?: { to: string; label: string }[];
  prevTo?: string;
  nextTo?: string;
  children: React.ReactNode;
}) {
  const nav = useNavigate();
  const { logout, role, user } = useAuth();
  const { lang, toggleLang } = useLanguage();

  const t = (en: string, my: string) => (lang === "en" ? en : my);

  return (
    <div className="min-h-screen bg-[#05080F] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#05080F]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 shrink-0" />
            <div className="min-w-0">
              <div className="text-sm font-black tracking-widest uppercase truncate">{title}</div>
              <div className="text-[10px] opacity-70 truncate">
                {(user as any)?.email ?? "—"} • {(role ?? "NO_ROLE")}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={() => toggleLang()}
              className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
              title={t("Switch to Myanmar", "English သို့ပြောင်းရန်")}
            >
              {lang === "en" ? "မြန်မာ" : "EN"}
            </button>

            {prevTo ? (
              <Link
                to={prevTo}
                className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                {t("Previous", "နောက်သို့")}
              </Link>
            ) : (
              <button
                onClick={() => nav(-1)}
                className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                {t("Back", "နောက်သို့")}
              </button>
            )}

            {nextTo ? (
              <Link
                to={nextTo}
                className="text-xs px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 hover:bg-emerald-500/20"
              >
                {t("Next", "ရှေ့သို့")}
              </Link>
            ) : null}

            <button
              className="text-xs px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
              onClick={() => void logout()}
            >
              {t("Sign out", "ထွက်မည်")}
            </button>
          </div>
        </div>

        {links?.length ? (
          <div className="mx-auto max-w-6xl px-4 pb-3 flex gap-2 flex-wrap">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-xs px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

export default PortalShell;
