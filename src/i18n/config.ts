import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: { 
      translation: { 
        "welcome": "Welcome to Britium Ventures", 
        "way.pickup": "Pickup Ways",
        "way.deliver": "Deliver Ways",
        "success.created": "Shipment Synchronized with Cloud Storage"
      } 
    },
    my: { 
      translation: { 
        "welcome": "Britium Ventures မှ ကြိုဆိုပါသည်", 
        "way.pickup": "ပစ္စည်းသိမ်းဆည်းမှု လမ်းကြောင်းများ",
        "way.deliver": "ပစ္စည်းပို့ဆောင်မှု လမ်းကြောင်းများ",
        "success.created": "ဒေတာများကို Cloud ပေါ်သို့ သိမ်းဆည်းပြီးပါပြီ"
      } 
    }
  },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
