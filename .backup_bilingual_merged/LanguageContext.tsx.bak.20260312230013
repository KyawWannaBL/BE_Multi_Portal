import * as React from "react";

export type Language = "en" | "my";

export type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  bi: (en: string, my: string) => string;
};

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = "app_language";

function readInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "my" ? "my" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(() => readInitialLanguage());

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, lang);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleLanguage = React.useCallback(() => {
    setLanguageState((prev) => {
      const next = prev === "en" ? "my" : "en";
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(STORAGE_KEY, next);
        }
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const bi = React.useCallback(
    (en: string, my: string) => (language === "en" ? en : my),
    [language]
  );

  const value = React.useMemo(
    () => ({ language, setLanguage, toggleLanguage, bi }),
    [language, setLanguage, toggleLanguage, bi]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    return {
      language: "en",
      setLanguage: () => {},
      toggleLanguage: () => {},
      bi: (en) => en,
    };
  }
  return ctx;
}
