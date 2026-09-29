import { apiRequest } from './api'

export interface EventCategoryName {
  locale_code: string
  text: string
}

export interface EventCategoryRecord {
  id: number
  names: EventCategoryName[]
}

export async function getEventCategories(): Promise<EventCategoryRecord[]> {
  return apiRequest<EventCategoryRecord[]>('/event-categories')
}

export function getEventCategoryName(category: EventCategoryRecord | undefined, locale: string, fallbackLocale: string): string {
  if (!category) return ''
  return category.names.find((name) => name.locale_code === locale)?.text
    ?? category.names.find((name) => name.locale_code === fallbackLocale)?.text
    ?? ''
}
