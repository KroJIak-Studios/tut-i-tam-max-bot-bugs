import type { SupportedLocaleCode } from '../i18n/types'
export type { SupportedLocaleCode }

export type MapProvider = 'yandex' | '2gis' | 'system'

export interface NotificationSettings {
  interestEvents: boolean
  eventReminders: boolean
  aiRecommendations: boolean
  scheduleChanges: boolean
}

export interface UserPreferences {
  name: string
  city: string
  avatarUrl: string
  interests: string[]
  pushkinCard: boolean
  defaultMapProvider: MapProvider
  notifications: NotificationSettings
  locale: SupportedLocaleCode
}
