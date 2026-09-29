import type { City, CityName, Locale } from '../types/city'

export const DEFAULT_FALLBACK_LOCALE_CODE = 'ru-ru'

/**
 * Returns the Locale matching the fallback code, or the first available locale,
 * or a synthetic Russian locale if the list is empty.
 */
export function getFallbackLocale(
  locales: Locale[],
  configuredCode = DEFAULT_FALLBACK_LOCALE_CODE,
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
    code: DEFAULT_FALLBACK_LOCALE_CODE,
    native_name: 'Русский',
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
  fallbackCode = DEFAULT_FALLBACK_LOCALE_CODE,
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
  fallbackCode = DEFAULT_FALLBACK_LOCALE_CODE,
): CityName[] {
  const normalizedFallback = fallbackCode.toLowerCase()
  return city.names.filter(
    (n) => n.locale_code.toLowerCase() !== normalizedFallback && n.text.trim(),
  )
}
