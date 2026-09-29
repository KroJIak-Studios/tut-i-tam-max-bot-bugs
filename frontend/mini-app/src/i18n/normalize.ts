import { SUPPORTED_LOCALES } from './config'
import { FALLBACK_LOCALE, type SupportedLocaleCode } from './types'

const LOCALE_PATTERN = /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/

export function canonicalizeLocale(input?: string | null): string | null {
  if (!input) return null
  const clean = input.trim().toLowerCase().replaceAll('_', '-')
  return LOCALE_PATTERN.test(clean) ? clean : null
}

export function normalizeLocale(input?: string | null): SupportedLocaleCode {
  const clean = canonicalizeLocale(input)
  return clean && SUPPORTED_LOCALES.some((locale) => locale.code === clean) ? clean : FALLBACK_LOCALE
}

export function detectBrowserLocale(): SupportedLocaleCode | null {
  if (typeof navigator === 'undefined') return null
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language]
  for (const candidate of candidates) {
    const clean = canonicalizeLocale(candidate)
    if (clean && SUPPORTED_LOCALES.some((locale) => locale.code === clean)) return clean
  }
  return null
}

export function resolveInitialLocale(savedLocale?: string | null, backendLocale?: string | null): SupportedLocaleCode {
  const backend = canonicalizeLocale(backendLocale)
  if (backend && SUPPORTED_LOCALES.some((locale) => locale.code === backend)) return backend
  const saved = canonicalizeLocale(savedLocale)
  if (saved && SUPPORTED_LOCALES.some((locale) => locale.code === saved)) return saved
  return detectBrowserLocale() ?? FALLBACK_LOCALE
}