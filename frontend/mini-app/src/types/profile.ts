import type { SupportedLocaleCode } from '../i18n/types'
export type { SupportedLocaleCode }

export type MapProvider = 'yandex' | '2gis' | 'system'

export type AppMapProviderId = 'osm' | 'osm_hot' | 'carto_voyager' | 'yandex' | 'google'

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
  appMapProvider: AppMapProviderId
  notifications: NotificationSettings
  locale: SupportedLocaleCode
}
