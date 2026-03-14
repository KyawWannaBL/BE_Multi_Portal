import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from './locales/en/common.json';
import myCommon from './locales/my/common.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'my'],
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    resources: {
      en: { common: enCommon },
      my: { common: myCommon }
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
