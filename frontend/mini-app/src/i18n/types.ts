export type SupportedLocaleCode = 'ru-RU' | 'en-US'

export interface SupportedLocale {
  code: SupportedLocaleCode
  nativeName: string
  name: string
}

export const FALLBACK_LOCALE: SupportedLocaleCode = 'ru-RU'

export const SUPPORTED_LOCALES: readonly SupportedLocale[] = [
  {
    code: 'ru-RU',
    nativeName: 'Русский',
    name: 'Russian',
  },
  {
    code: 'en-US',
    nativeName: 'English',
    name: 'English',
  },
] as const
