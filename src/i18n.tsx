import { useCallback, useSyncExternalStore } from "react";

export type AppLang = "en" | "my";

const STORAGE_KEY = "app_lang";

type Listener = () => void;

const listeners = new Set<Listener>();

function readLangFromStorage(): AppLang {
  if (typeof window === "undefined") return "en";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "my" || v === "en" ? v : "en";
}

let currentLang: AppLang = readLangFromStorage();

function emit() {
  for (const l of Array.from(listeners)) l();
}

function setCurrentLang(lang: AppLang) {
  currentLang = lang;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
  emit();
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentLang;
}

function getServerSnapshot(): AppLang {
  return "en";
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    if (e.newValue === "en" || e.newValue === "my") {
      currentLang = e.newValue;
      emit();
    }
  });
}

export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLang = useCallback((next: AppLang) => {
    setCurrentLang(next);
  }, []);

  const toggleLang = useCallback(() => {
    setCurrentLang(lang === "en" ? "my" : "en");
  }, [lang]);

  const bi = useCallback(
    (en: string, my: string) => (lang === "en" ? en : my),
    [lang]
  );

  return { lang, setLang, toggleLang, bi };
}
