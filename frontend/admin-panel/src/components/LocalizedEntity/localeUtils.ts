import type { LocaleName, LocaleItem } from './types'

/** Get primary (fallback locale) name from names array */
export function getPrimaryName(
  names: LocaleName[],
  fallbackLocaleCode: string,
): string {
  const primary = names.find((n) => n.locale_code === fallbackLocaleCode)
  if (primary) return primary.text
  return names[0]?.text ?? ''
}

/** Get all translations except the fallback locale */
export function getSecondaryNames(
  names: LocaleName[],
  fallbackLocaleCode: string,
): LocaleName[] {
  return names.filter((n) => n.locale_code !== fallbackLocaleCode)
}

/** Get the human-readable native name for a locale code */
export function getLocaleNativeName(
  code: string,
  locales: LocaleItem[],
): string {
  return locales.find((l) => l.code === code)?.native_name ?? code
}
