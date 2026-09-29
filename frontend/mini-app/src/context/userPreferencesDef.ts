import { createContext } from 'react'
import type { UserPreferences, MapProvider, AppMapProviderId, NotificationSettings, SupportedLocaleCode } from '../types'

export interface UserPreferencesContextValue {
  preferences: UserPreferences
  updateProfile: (name: string, city: string) => void
  updateInterests: (interests: string[]) => void
  togglePushkinCard: () => void
  setPushkinCard: (enabled: boolean) => void
  setDefaultMapProvider: (provider: MapProvider) => void
  setAppMapProvider: (provider: AppMapProviderId) => void
  updateNotifications: (settings: Partial<NotificationSettings>) => void
  setLocale: (locale: SupportedLocaleCode) => void
  resetPreferences: () => void
}

export const AVAILABLE_INTERESTS: string[] = [
  'walks',
  'museums',
  'sport',
  'volunteering',
  'concerts',
  'theatres',
  'parks',
  'lectures',
  'cinema',
  'food',
  'festivals',
  'boardgames',
]

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'Анна',
  city: 'kazan',
  avatarUrl: '/avatar-anna.jpg',
  interests: ['walks', 'museums', 'sport', 'volunteering'],
  smartInterestRotation: true,
  pushkinCard: true,
  defaultMapProvider: 'yandex',
  appMapProvider: 'osm',
  notifications: {
    notificationsEnabled: true,
    notificationsSilent: false,
    eventReminders: true,
    scheduleChanges: true,
  },
  locale: 'ru-ru',
}

export const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null)
