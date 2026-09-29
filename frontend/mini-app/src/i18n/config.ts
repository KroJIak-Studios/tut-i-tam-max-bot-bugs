import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { FALLBACK_LOCALE } from './types'

function flattenTranslation(value: unknown, prefix = '', result: Record<string, string> = {}): Record<string, string> {
  if (typeof value === 'string') {
    if (prefix) result[prefix] = value
    return result
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, nested] of Object.entries(value)) {
      flattenTranslation(nested, prefix ? `${prefix}.${key}` : key, result)
    }
  }
  return result
}

function moduleValue<T>(value: T | (() => T)): T {
  return typeof value === 'function' ? (value as () => T)() : value
}

const localeModules = import.meta.glob('./locales/*.ts', { eager: true }) as Record<
  string,
  { localeName: string | (() => string); translation: object | (() => object) }
>

export const defaultNS = 'translation'

export const SUPPORTED_LOCALES = Object.entries(localeModules)
  .map(([path, module]) => ({
    code: path.slice(path.lastIndexOf('/') + 1, -'.ts'.length),
    nativeName: moduleValue(module.localeName),
    translation: moduleValue(module.translation),
  }))
  .sort((left, right) => left.code === FALLBACK_LOCALE ? -1 : right.code === FALLBACK_LOCALE ? 1 : left.code.localeCompare(right.code))

export const resources = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale.code, { translation: locale.translation }]),
)

i18n.use(initReactI18next).init({
  resources,
  defaultNS,
  lng: FALLBACK_LOCALE,
  fallbackLng: FALLBACK_LOCALE,
  interpolation: { escapeValue: false },
  returnNull: false,
})

const dictionaries = Object.fromEntries(
  SUPPORTED_LOCALES.map((locale) => [locale.code, flattenTranslation(locale.translation)]),
)

i18n.services.interpolator.init({ escapeValue: false }, true)

const originalTranslate = i18n.t.bind(i18n)
i18n.t = ((key: unknown, options?: unknown) => {
  if (typeof key === 'string') {
    const value = dictionaries[i18n.language]?.[key] ?? dictionaries[FALLBACK_LOCALE]?.[key]
    if (value !== undefined) return i18n.services.interpolator.interpolate(value, options ?? {}, i18n.language, {})
  }
  return originalTranslate(key as never, options as never)
}) as typeof i18n.t

export default i18n
