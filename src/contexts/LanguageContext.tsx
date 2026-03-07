import React, { createContext, useContext, useState, useEffect } from "react";
const LanguageContext = createContext<any>(null);
export const LanguageProvider = ({ children }: any) => {
  const [lang, setLang] = useState(localStorage.getItem("be_lang") || "en");
  const toggleLang = () => setLang(l => l === "en" ? "my" : "en");
  useEffect(() => { localStorage.setItem("be_lang", lang); }, [lang]);
  return <LanguageContext.Provider value={{ lang, setLanguage: setLang, toggleLang }}>{children}</LanguageContext.Provider>;
};
export const useLanguage = () => useContext(LanguageContext);
