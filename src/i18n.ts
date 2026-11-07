import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import mr from './locales/mr.json';
import hi from './locales/hi.json';
import en from './locales/en.json';

const savedLang = localStorage.getItem('smart_farm_lang') || 'mr';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      mr: { translation: mr },
      hi: { translation: hi },
      en: { translation: en },
    },
    lng: savedLang,
    fallbackLng: 'mr',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'smart_farm_lang',
      caches: ['localStorage'],
    },
  });

export const setAppLanguage = (lang: 'mr' | 'hi' | 'en') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('smart_farm_lang', lang);
  document.documentElement.lang = lang;
};

export default i18n;
