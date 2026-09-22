import React, { useState, useEffect, useCallback } from 'react'
import type { UserPreferences, MapProvider, NotificationSettings } from '../types'
import { UserPreferencesContext, DEFAULT_PREFERENCES } from './userPreferencesDef'

const STORAGE_KEY_PREFERENCES = 'tut_i_tam_user_preferences'

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFERENCES)
    if (!raw) return DEFAULT_PREFERENCES
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
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
        resetPreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}
