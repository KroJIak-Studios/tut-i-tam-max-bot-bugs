import { DEFAULT_FALLBACK_LOCALE, runtimeConfig } from '../../../config/runtimeConfig'
import type { City, CityName, Locale } from '../types/city'

export const DEFAULT_FALLBACK_LOCALE_CODE = DEFAULT_FALLBACK_LOCALE

/**
 * Resolves the fallback locale code from shared runtime configuration.
 */
export function getConfiguredFallbackLocaleCode(): string {
  return runtimeConfig.fallbackLocale
}

/**
 * Returns the Locale matching the configured code from the API locales list,
 * resolving the native_name dynamically.
 */
export function getFallbackLocale(
  locales: Locale[],
  configuredCode = getConfiguredFallbackLocaleCode(),
): Locale {
  const normalizedConfigured = configuredCode.toLowerCase()
  const found = locales.find((l) => l.code.toLowerCase() === normalizedConfigured)
  if (found) {
    return found
  }
  if (locales.length > 0) {
    return locales[0]
  }
  return {
    code: normalizedConfigured,
    native_name: normalizedConfigured,
  }
}

/**
 * Formats a human-readable label for a locale: "Русский (ru-ru)".
 */
export function getLocaleDisplayName(code: string, locales: Locale[]): string {
  const normalized = code.toLowerCase()
  const found = locales.find((l) => l.code.toLowerCase() === normalized)
  if (found) {
    return `${found.native_name} (${found.code})`
  }
  return code
}

/**
 * Extracts the primary name of the city using the fallback locale code.
 * If the fallback translation is missing, returns the first available translation or a placeholder.
 */
export function getCityMainName(
  city: City,
  fallbackCode = getConfiguredFallbackLocaleCode(),
): string {
  const normalizedFallback = fallbackCode.toLowerCase()
  const primaryName = city.names.find(
    (n) => n.locale_code.toLowerCase() === normalizedFallback,
  )
  if (primaryName && primaryName.text.trim()) {
    return primaryName.text.trim()
  }
  if (city.names.length > 0 && city.names[0].text.trim()) {
    return city.names[0].text.trim()
  }
  return `Город #${city.id}`
}

/**
 * Extracts all non-fallback translations for display badges.
 */
export function getCityAdditionalNames(
  city: City,
  fallbackCode = getConfiguredFallbackLocaleCode(),
): CityName[] {
  const normalizedFallback = fallbackCode.toLowerCase()
  return city.names.filter(
    (n) => n.locale_code.toLowerCase() !== normalizedFallback && n.text.trim(),
  )
}
