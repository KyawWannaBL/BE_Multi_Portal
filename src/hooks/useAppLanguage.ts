import * as React from "react";

export type AppLanguage = "en" | "my";

const STORAGE_KEY = "app_language";

function readLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "my" ? "my" : "en";
}

export function useAppLanguage() {
  const [language, setLanguageState] = React.useState<AppLanguage>(readLanguage);

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  React.useEffect(() => {
    const handler = (event: Event) => {
      const next = (event as CustomEvent<AppLanguage>).detail;
      setLanguageState(next === "my" ? "my" : "en");
    };

    if (typeof window !== "undefined") {
      window.addEventListener("app-language-change", handler as EventListener);
      return () => window.removeEventListener("app-language-change", handler as EventListener);
    }
  }, []);

  const setLanguage = React.useCallback((lang: AppLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, lang);
      window.dispatchEvent(new CustomEvent("app-language-change", { detail: lang }));
    }
  }, []);

  return { language, setLanguage };
}
