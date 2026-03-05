import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'my';
interface LanguageContextType { lang: Language; toggleLang: () => void; }

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('btx_lang') as Language;
    if (saved) setLang(saved);
  }, []);

  const toggleLang = () => {
    const next = lang === 'en' ? 'my' : 'en';
    setLang(next);
    localStorage.setItem('btx_lang', next);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
