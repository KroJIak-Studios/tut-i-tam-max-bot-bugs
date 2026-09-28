import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { ruRU } from './locales/ru-RU'
import { enUS } from './locales/en-US'
import { FALLBACK_LOCALE } from './types'

export const defaultNS = 'translation'
export const resources = {
  'ru-RU': {
    translation: ruRU,
  },
  'en-US': {
    translation: enUS,
  },
} as const

i18n
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    lng: FALLBACK_LOCALE,
    fallbackLng: FALLBACK_LOCALE,
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  })

export default i18n
