import { FALLBACK_LOCALE, SUPPORTED_LOCALES, type SupportedLocaleCode } from './types'

/**
 * Normalizes any locale string (BCP-47, POSIX, backend 'ru-ru', browser 'en-US', etc.)
 * to a supported canonical locale code.
 *
 * Case-insensitive:
 * - 'ru-ru', 'ru-RU', 'RU-ru', 'ru_RU', 'ru' -> 'ru-RU'
 * - 'en-us', 'en-US', 'EN-us', 'en_US', 'en', 'en-gb' -> 'en-US'
 * - Unsupported / invalid / empty -> FALLBACK_LOCALE ('ru-RU')
 */
export function normalizeLocale(input?: string | null): SupportedLocaleCode {
  if (!input || typeof input !== 'string') {
    return FALLBACK_LOCALE
  }

  const clean = input.trim().toLowerCase().replace('_', '-')

  // Exact canonical match check
  for (const item of SUPPORTED_LOCALES) {
    if (item.code.toLowerCase() === clean) {
      return item.code
    }
  }

  // Language subtag prefix match (e.g. 'ru' or 'ru-kz' -> 'ru-RU', 'en' or 'en-ca' -> 'en-US')
  const langPrefix = clean.split('-')[0]
  if (langPrefix === 'ru') {
    return 'ru-RU'
  }
  if (langPrefix === 'en') {
    return 'en-US'
  }

  return FALLBACK_LOCALE
}

/**
 * Inspects browser environment locales via navigator.languages or navigator.language.
 * Returns a supported locale code or null if unsupported.
 */
export function detectBrowserLocale(): SupportedLocaleCode | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null
  }

  const candidates = navigator.languages && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language]

  for (const lang of candidates) {
    if (!lang) continue
    const clean = lang.trim().toLowerCase()
    if (clean.startsWith('ru')) {
      return 'ru-RU'
    }
    if (clean.startsWith('en')) {
      return 'en-US'
    }
  }

  return null
}

/**
 * Resolves locale by priority:
 * 1. backend user.locale (when available)
 * 2. saved user preference in localStorage
 * 3. browser locale (if supported)
 * 4. FALLBACK_LOCALE ('ru-RU')
 */
export function resolveInitialLocale(
  savedLocale?: string | null,
  backendLocale?: string | null,
): SupportedLocaleCode {
  if (backendLocale) {
    return normalizeLocale(backendLocale)
  }

  if (savedLocale) {
    return normalizeLocale(savedLocale)
  }

  const detected = detectBrowserLocale()
  if (detected) {
    return detected
  }

  return FALLBACK_LOCALE
}
