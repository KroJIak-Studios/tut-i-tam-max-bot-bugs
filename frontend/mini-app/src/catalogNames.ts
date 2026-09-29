import { FALLBACK_LOCALE } from './i18n'

export interface LocalizedName {
  locale_code: string
  text: string
}

export interface CatalogItem {
  id: number
  names: LocalizedName[]
}

export interface CatalogInterest extends CatalogItem {
  color: string
}

export function localizedName(names: LocalizedName[], locale: string): string {
  return names.find((name) => name.locale_code === locale)?.text
    ?? names.find((name) => name.locale_code === FALLBACK_LOCALE)?.text
    ?? ''
}
