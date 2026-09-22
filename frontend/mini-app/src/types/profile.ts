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
}
