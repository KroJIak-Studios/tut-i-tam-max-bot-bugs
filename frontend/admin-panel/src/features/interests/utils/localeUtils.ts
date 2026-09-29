import type {
  InterestFormData,
  InterestItem,
  InterestName,
  Locale,
  LocalizedNameInput,
} from '../types'

export function getFallbackLocaleCode(locales: Locale[]): string {
  const envFallback = import.meta.env.VITE_FALLBACK_LOCALE
  if (envFallback && locales.some((l) => l.code === envFallback)) {
    return envFallback
  }
  const ru = locales.find((l) => l.code === 'ru-ru')
  if (ru) {
    return ru.code
  }
  return locales[0]?.code || 'ru-ru'
}

export function getLocaleNativeName(locales: Locale[], code: string): string {
  const found = locales.find((l) => l.code === code)
  return found ? found.native_name : code
}

export function getPrimaryName(
  interest: InterestItem,
  fallbackCode: string,
): string {
  const found = interest.names.find((n) => n.locale_code === fallbackCode)
  if (found && found.text) {
    return found.text
  }
  return interest.names[0]?.text || ''
}

export function getSecondaryTranslations(
  interest: InterestItem,
  fallbackCode: string,
): InterestName[] {
  // If the interest has a translation for fallbackCode, secondary is all other translations.
  // Otherwise, the first name was used as primary, so secondary is the rest.
  const hasFallback = interest.names.some((n) => n.locale_code === fallbackCode)
  const primaryCode = hasFallback ? fallbackCode : interest.names[0]?.locale_code
  return interest.names.filter((n) => n.locale_code !== primaryCode)
}

let nextTempId = 1
export function generateRowId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  nextTempId += 1
  return `trans-${Date.now()}-${nextTempId}`
}

export function prepareInitialFormData(
  interest: InterestItem | null,
  fallbackCode: string,
): InterestFormData {
  if (!interest) {
    return {
      primaryName: '',
      primaryLocaleCode: fallbackCode,
      translations: [],
    }
  }

  const hasFallback = interest.names.some((n) => n.locale_code === fallbackCode)
  const primaryItem = hasFallback
    ? interest.names.find((n) => n.locale_code === fallbackCode)
    : interest.names[0]

  const primaryLocaleCode = primaryItem?.locale_code || fallbackCode
  const primaryName = primaryItem?.text || ''

  const secondaryNames = interest.names.filter(
    (n) => n !== primaryItem && n.locale_code !== primaryLocaleCode,
  )

  const translations = secondaryNames.map((n) => ({
    id: generateRowId(),
    locale_code: n.locale_code,
    text: n.text,
  }))

  return {
    primaryName,
    primaryLocaleCode,
    translations,
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: {
    primaryName?: string
    translations?: Record<string, string>
    general?: string
  }
}

export function validateInterestForm(
  formData: InterestFormData,
): ValidationResult {
  const errors: ValidationResult['errors'] = {}
  let isValid = true

  const trimmedPrimary = formData.primaryName.trim()
  if (!trimmedPrimary) {
    errors.primaryName = 'Укажите основное название интереса'
    isValid = false
  } else if (trimmedPrimary.length > 255) {
    errors.primaryName = 'Название не должно превышать 255 символов'
    isValid = false
  }

  const translationErrors: Record<string, string> = {}
  const seenLocales = new Set<string>([formData.primaryLocaleCode])

  for (const trans of formData.translations) {
    const trimmedText = trans.text.trim()
    if (!trans.locale_code) {
      translationErrors[trans.id] = 'Выберите язык перевода'
      isValid = false
    } else if (seenLocales.has(trans.locale_code)) {
      translationErrors[trans.id] = 'Этот язык уже используется'
      isValid = false
    } else if (!trimmedText) {
      translationErrors[trans.id] = 'Введите текст перевода'
      isValid = false
    } else if (trimmedText.length > 255) {
      translationErrors[trans.id] = 'Перевод не должен превышать 255 символов'
      isValid = false
    }
    if (trans.locale_code) {
      seenLocales.add(trans.locale_code)
    }
  }

  if (Object.keys(translationErrors).length > 0) {
    errors.translations = translationErrors
  }

  return { isValid, errors }
}

export function buildPayload(
  formData: InterestFormData,
): { names: LocalizedNameInput[] } {
  const names: LocalizedNameInput[] = [
    {
      locale_code: formData.primaryLocaleCode,
      text: formData.primaryName.trim(),
    },
  ]

  const seen = new Set<string>([formData.primaryLocaleCode])
  for (const row of formData.translations) {
    const code = row.locale_code.trim()
    const text = row.text.trim()
    if (code && text && !seen.has(code)) {
      seen.add(code)
      names.push({ locale_code: code, text })
    }
  }

  return { names }
}
