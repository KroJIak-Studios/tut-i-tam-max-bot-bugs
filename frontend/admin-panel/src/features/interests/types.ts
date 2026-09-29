export interface Locale {
  code: string
  native_name: string
}

export interface InterestName {
  locale_code: string
  text: string
}

export interface InterestItem {
  id: number
  names: InterestName[]
  color?: string
}

export interface TranslationRow {
  id: string
  locale_code: string
  text: string
}

export interface InterestFormData {
  primaryName: string
  primaryLocaleCode: string
  translations: TranslationRow[]
}

export interface LocalizedNameInput {
  locale_code: string
  text: string
}

export interface InterestCreatePayload {
  names: LocalizedNameInput[]
}

export interface InterestPatchPayload {
  names: LocalizedNameInput[]
}
