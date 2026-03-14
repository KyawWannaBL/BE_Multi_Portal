import React, { createContext, useContext, useState } from 'react';
export type Language = 'en' | 'my';
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (en: string, my?: string) => string;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const t = (en: string, my?: string): string => (language === 'my' && my ? my : en);
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
export const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguageContext must be used within LanguageProvider');
  return context;
};
