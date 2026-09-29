export const DEFAULT_FALLBACK_LOCALE = 'ru-ru'

export interface RuntimeConfig {
  fallbackLocale: string
}

export function resolveFallbackLocale(): string {
  const envVal =
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.VITE_FALLBACK_LOCALE || import.meta.env?.FALLBACK_LOCALE)) ||
    DEFAULT_FALLBACK_LOCALE
  return String(envVal).trim().toLowerCase()
}

export const runtimeConfig: RuntimeConfig = {
  fallbackLocale: resolveFallbackLocale(),
}
