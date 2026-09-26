import { createContext } from 'react'
import type { UserPreferences, MapProvider, NotificationSettings, SupportedLocaleCode } from '../types'

export interface UserPreferencesContextValue {
  preferences: UserPreferences
  updateProfile: (name: string, city: string) => void
  updateInterests: (interests: string[]) => void
  togglePushkinCard: () => void
  setPushkinCard: (enabled: boolean) => void
  setDefaultMapProvider: (provider: MapProvider) => void
  updateNotifications: (settings: Partial<NotificationSettings>) => void
  setLocale: (locale: SupportedLocaleCode) => void
  resetPreferences: () => void
}

export const AVAILABLE_INTERESTS: string[] = [
  'прогулки',
  'музеи',
  'спорт',
  'волонтёрство',
  'концерты',
  'театры',
  'парки',
  'лекции',
  'кино',
  'гастрономия',
  'фестивали',
  'настолки',
]

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: 'Анна',
  city: 'Казань',
  avatarUrl: '/avatar-anna.jpg',
  interests: ['прогулки', 'музеи', 'спорт', 'волонтёрство'],
  pushkinCard: true,
  defaultMapProvider: 'yandex',
  notifications: {
    interestEvents: true,
    eventReminders: true,
    aiRecommendations: true,
    scheduleChanges: true,
  },
  locale: 'ru-RU',
}

export const UserPreferencesContext = createContext<UserPreferencesContextValue | null>(null)
