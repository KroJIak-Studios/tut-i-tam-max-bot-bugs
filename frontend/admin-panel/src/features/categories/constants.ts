import type { CategoryName, LocaleItem } from './types'

/**
 * Резервный FALLBACK_LOCALE на случай отсутствия локальной или docker конфигурации.
 * Продуктовое значение настраивается через конфигурацию запуска (VITE_FALLBACK_LOCALE в .env.local
 * или переменные окружения контейнера в docker-compose.yml).
 */
export const DEFAULT_BACKUP_LOCALE = 'ru-ru'

/**
 * Получить сконфигурированный FALLBACK_LOCALE из окружения Vite:
 * 1) VITE_FALLBACK_LOCALE из .env.local / compose
 * 2) FALLBACK_LOCALE (если передана в окружение)
 * 3) Резервный DEFAULT_BACKUP_LOCALE ('ru-ru')
 */
export function getConfiguredFallbackLocale(): string {
  const envVal =
    import.meta.env.VITE_FALLBACK_LOCALE ||
    (import.meta.env as Record<string, string | undefined>).FALLBACK_LOCALE
  return (envVal && envVal.trim()) || DEFAULT_BACKUP_LOCALE
}

export const DEFAULT_FALLBACK_LOCALE = getConfiguredFallbackLocale()

/**
 * Получить отображаемое название локали по её коду:
 * configured FALLBACK_LOCALE -> locales -> native_name
 * Слово "Русский" или любое другое никогда не хардкодится.
 */
export function getLocaleNativeName(
  localeCode: string,
  locales: LocaleItem[],
): string {
  const normalized = localeCode.toLowerCase().trim()
  const found = locales.find((l) => l.code.toLowerCase().trim() === normalized)
  return found ? found.native_name : localeCode
}

/**
 * Разделить переводы категории на основной перевод (соответствующий fallbackLocale)
 * и дополнительные переводы.
 */
export function splitCategoryNames(
  names: CategoryName[],
  fallbackLocale: string,
): {
  primaryName: string
  otherTranslations: CategoryName[]
} {
  const normalizedFallback = fallbackLocale.toLowerCase().trim()

  const primaryItem = names.find(
    (n) => n.locale_code.toLowerCase().trim() === normalizedFallback,
  )

  if (primaryItem) {
    return {
      primaryName: primaryItem.text,
      otherTranslations: names.filter(
        (n) => n.locale_code.toLowerCase().trim() !== normalizedFallback,
      ),
    }
  }

  // Если точного совпадения нет (например, создано через API с другим locale), берем первое
  if (names.length > 0) {
    return {
      primaryName: names[0].text,
      otherTranslations: names.slice(1),
    }
  }

  return {
    primaryName: '',
    otherTranslations: [],
  }
}
