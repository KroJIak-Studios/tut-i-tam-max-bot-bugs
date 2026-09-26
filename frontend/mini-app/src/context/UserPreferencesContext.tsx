import React, { useState, useEffect, useCallback } from 'react'
import type { UserPreferences, MapProvider, NotificationSettings, SupportedLocaleCode } from '../types'
import { UserPreferencesContext, DEFAULT_PREFERENCES } from './userPreferencesDef'
import { resolveInitialLocale, normalizeLocale, i18n } from '../i18n'

const STORAGE_KEY_PREFERENCES = 'tut_i_tam_user_preferences'

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
    const resolvedLocale = resolveInitialLocale(parsed.locale)
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      locale: resolvedLocale,
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
      city: city.trim() || prev.city,
    }))
  }, [])

  const updateInterests = useCallback((interests: string[]) => {
    setPreferences((prev) => ({
      ...prev,
      interests,
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
        updateNotifications,
        setLocale,
        resetPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}
