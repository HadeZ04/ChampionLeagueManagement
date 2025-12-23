import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import vi from './locales/vi/common.json'
import en from './locales/en/common.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: { translation: vi },
      en: { translation: en }
    },
    fallbackLng: 'vi',
    lng: 'vi', // mặc định là tiếng Việt
    interpolation: { escapeValue: false },
    detection: {
      // ưu tiên đọc từ localStorage để nhớ lựa chọn của user
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
