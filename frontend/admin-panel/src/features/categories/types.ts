export interface CategoryName {
  locale_code: string
  text: string
}

export interface EventCategory {
  id: number
  names: CategoryName[]
}

export interface EventCategoryInput {
  names: CategoryName[]
}

export interface LocaleItem {
  code: string
  native_name: string
}

export interface TranslationFormItem {
  id: string
  locale_code: string
  text: string
}

export interface CategoryFormData {
  primaryText: string
  translations: TranslationFormItem[]
}

export interface CategoryFormErrors {
  primaryText?: string
  translations?: Record<string, { locale_code?: string; text?: string }>
  general?: string
}

export interface CategoryToastState {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}
