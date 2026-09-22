import { useContext } from 'react'
import { UserPreferencesContext } from './userPreferencesDef'
import type { UserPreferencesContextValue } from './userPreferencesDef'

export function useUserPreferences(): UserPreferencesContextValue {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}
