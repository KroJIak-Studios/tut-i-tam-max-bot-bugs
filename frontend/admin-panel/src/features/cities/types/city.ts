export interface Locale {
  code: string
  native_name: string
}

export interface CityName {
  locale_code: string
  text: string
}

export interface City {
  id: number
  names: CityName[]
  latitude?: number | null
  longitude?: number | null
}

export interface CityCreatePayload {
  names: CityName[]
  latitude?: number | null
  longitude?: number | null
}

export interface TranslationFormItem {
  id: string
  locale_code: string
  text: string
}

export interface CityFormValues {
  mainText: string
  additionalTranslations: TranslationFormItem[]
  latitude: number | null
  longitude: number | null
}

export interface CityFormErrors {
  mainText?: string
  translations?: Record<string, string>
  coordinates?: string
  general?: string
}
