import type { CategoryName, LocaleItem } from './types'

/**
 * Временный дефолтный FALLBACK_LOCALE для Admin Panel,
 * пока бэкенд не предоставляет эндпоинт настроек FALLBACK_LOCALE.
 * Архитектура построена так, что значение передаётся через пропсы/параметры,
 * поэтому при появлении серверного эндпоинта форма не потребует переписывания.
 */
export const DEFAULT_FALLBACK_LOCALE = 'ru-ru'

/**
 * Получить отображаемое название локали по её коду:
 * FALLBACK_LOCALE -> locales -> native_name
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
