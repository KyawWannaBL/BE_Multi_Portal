import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Language = "en" | "my";

type Ctx = {
  lang: Language;
  toggleLang: () => void;
  t: (en: string, my?: string) => string;
};

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("btx_lang");
    if (saved === "en" || saved === "my") setLang(saved);
  }, []);

  const toggleLang = () => {
    const next: Language = lang === "en" ? "my" : "en";
    setLang(next);
    localStorage.setItem("btx_lang", next);
  };

  const t = useMemo(() => (en: string, my?: string) => (lang === "my" && my ? my : en), [lang]);

  return <LanguageContext.Provider value={{ lang, toggleLang, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const v = useContext(LanguageContext);
  if (!v) throw new Error("useLanguage must be used within LanguageProvider");
  return v;
}
