import React, { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "./translations";

type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
};

const Ctx = createContext<I18nCtx | null>(null);

const STORAGE_KEY = "beda.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const v = localStorage.getItem(STORAGE_KEY);
    return (v === "my" || v === "en") ? (v as Lang) : "my";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORAGE_KEY, l);
  };

  const toggleLang = () => setLang(lang === "en" ? "my" : "en");

  const value = useMemo(() => ({ lang, setLang, toggleLang }), [lang]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
