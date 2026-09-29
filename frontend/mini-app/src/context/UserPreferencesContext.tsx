import React, { useState, useEffect, useCallback } from 'react'
import type { UserPreferences, MapProvider, AppMapProviderId, NotificationSettings, SupportedLocaleCode } from '../types'
import { UserPreferencesContext, DEFAULT_PREFERENCES } from './userPreferencesDef'
import { canonicalizeLocale, resolveInitialLocale, normalizeLocale, i18n } from '../i18n'

const STORAGE_KEY_PREFERENCES = 'tut_i_tam_user_preferences'

const VALID_APP_MAP_PROVIDERS = new Set<string>(['osm', 'osm_hot', 'carto_voyager', 'yandex', 'google'])

function normalizeAppMapProvider(provider: unknown): AppMapProviderId {
  if (typeof provider === 'string' && VALID_APP_MAP_PROVIDERS.has(provider)) {
    return provider as AppMapProviderId
  }
  return DEFAULT_PREFERENCES.appMapProvider
}

const LEGACY_INTEREST_TO_ID: Record<string, string> = {
  'прогулки': 'walks',
  'музеи': 'museums',
  'спорт': 'sport',
  'волонтёрство': 'volunteering',
  'волонтерство': 'volunteering',
  'концерты': 'concerts',
  'театры': 'theatres',
  'парки': 'parks',
  'лекции': 'lectures',
  'кино': 'cinema',
  'гастрономия': 'food',
  'фестивали': 'festivals',
  'настолки': 'boardgames',
}

const LEGACY_CITY_TO_ID: Record<string, string> = {
  'казань': 'kazan',
  'kazan': 'kazan',
}

function normalizeInterests(interests: unknown): string[] {
  if (!Array.isArray(interests)) {
    return DEFAULT_PREFERENCES.interests
  }
  const normalized = interests
    .map((item) => {
      if (typeof item !== 'string') return ''
      const lower = item.toLowerCase().trim()
      return LEGACY_INTEREST_TO_ID[lower] || lower
    })
    .filter(Boolean)

  return normalized.length > 0 ? normalized : DEFAULT_PREFERENCES.interests
}

function normalizeCity(city: unknown): string {
  if (typeof city !== 'string') return DEFAULT_PREFERENCES.city
  const lower = city.toLowerCase().trim()
  return LEGACY_CITY_TO_ID[lower] || city.trim() || DEFAULT_PREFERENCES.city
}

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFERENCES)
    if (!raw) {
      const initialLocale = resolveInitialLocale(null)
      return {
        ...DEFAULT_PREFERENCES,
        locale: initialLocale,
      }
    }
    const parsed = JSON.parse(raw)
    const resolvedLocale = resolveInitialLocale(canonicalizeLocale(parsed.locale))
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      city: normalizeCity(parsed.city),
      interests: normalizeInterests(parsed.interests),
      locale: resolvedLocale,
      appMapProvider: normalizeAppMapProvider(parsed.appMapProvider),
      notifications: {
        ...DEFAULT_PREFERENCES.notifications,
        ...(parsed.notifications || {}),
      },
    }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(prefs))
  } catch {
    // ignore storage errors
  }
}

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadPreferences())

  useEffect(() => {
    savePreferences(preferences)
  }, [preferences])

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY_PREFERENCES) {
        setPreferences(loadPreferences())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    if (i18n.language !== preferences.locale) {
      void i18n.changeLanguage(preferences.locale)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = preferences.locale
    }
  }, [preferences.locale])

  const setLocale = useCallback((locale: SupportedLocaleCode) => {
    const normalized = normalizeLocale(locale)
    setPreferences((prev) => ({
      ...prev,
      locale: normalized,
    }))
    if (i18n.language !== normalized) {
      void i18n.changeLanguage(normalized)
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = normalized
    }
  }, [])

  const updateProfile = useCallback((name: string, city: string) => {
    setPreferences((prev) => ({
      ...prev,
      name: name.trim() || prev.name,
      city: normalizeCity(city),
    }))
  }, [])

  const updateInterests = useCallback((interests: string[]) => {
    setPreferences((prev) => ({
      ...prev,
      interests: normalizeInterests(interests),
    }))
  }, [])

  const togglePushkinCard = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      pushkinCard: !prev.pushkinCard,
    }))
  }, [])

  const setPushkinCard = useCallback((enabled: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      pushkinCard: enabled,
    }))
  }, [])

  const setDefaultMapProvider = useCallback((provider: MapProvider) => {
    setPreferences((prev) => ({
      ...prev,
      defaultMapProvider: provider,
    }))
  }, [])

  const setAppMapProvider = useCallback((provider: AppMapProviderId) => {
    setPreferences((prev) => ({
      ...prev,
      appMapProvider: provider,
    }))
  }, [])

  const updateNotifications = useCallback((settings: Partial<NotificationSettings>) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        ...settings,
      },
    }))
  }, [])

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
  }, [])

  return (
    <UserPreferencesContext.Provider
      value={{
        preferences,
        updateProfile,
        updateInterests,
        togglePushkinCard,
        setPushkinCard,
        setDefaultMapProvider,
        setAppMapProvider,
        updateNotifications,
        setLocale,
        resetPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}
