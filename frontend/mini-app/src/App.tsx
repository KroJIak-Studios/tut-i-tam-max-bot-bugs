import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AttendanceProvider } from './context/AttendanceContext'
import { UserPreferencesProvider } from './context/UserPreferencesContext'
import { useUserPreferences } from './context/useUserPreferences'
import { ReviewsProvider } from './context/ReviewsContext'
import { ApiError, loadLocalDevAuth, localDevUser } from './services/api'
import { loadProfileBundle, readProfileBundle } from './services/profileService'
import { normalizeLocale } from './i18n/normalize'
import { GeolocationProvider } from './context/GeolocationContext'
import { HomePage } from './components/HomePage'
import { NearbySearchPage } from './components/Nearby/NearbySearchPage'
import { MapPage } from './components/Map/MapPage'
import { ChatPage } from './components/Chat/ChatPage'
import { PlansPage } from './components/Plans/PlansPage'
import { ProfilePage } from './components/Profile/ProfilePage'
import { CatalogPage } from './components/Catalog/CatalogPage'
import { EventDetailsPage } from './components/Event/EventDetailsPage'
import { CreateEventPage } from './components/CreateEvent/CreateEventPage'
import { RequestDetailPage } from './components/Profile/Requests/RequestDetailPage'
import { LocalDevLogin } from './components/LocalDevLogin'

const LOCAL_DEV_USER_KEY = 'tut_i_tam_dev_user'

function ApplyProfileLocale() {
  const { preferences, setLocale } = useUserPreferences()
  useEffect(() => {
    const locale = normalizeLocale(readProfileBundle()?.me.locale)
    if (locale !== preferences.locale) setLocale(locale)
  }, [preferences.locale, setLocale])
  return null
}

function AccessGate({ accessCode }: { accessCode: boolean }) {
  const { i18n } = useTranslation()
  const english = i18n.language.startsWith('en') || (!i18n.language && navigator.language.startsWith('en'))
  return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>{accessCode ? (english ? 'Enter the access code in the bot' : 'Введите контрольное слово в боте') : (english ? 'Open the mini app in MAX' : 'Откройте мини-приложение в MAX')}</div>
}

function AppContent() {
  const [devUser, setDevUser] = useState<ReturnType<typeof localDevUser>>()
  const [localDev, setLocalDev] = useState(false)
  const [gate, setGate] = useState<'checking' | 'allowed' | 'access' | 'auth'>('checking')
  useEffect(() => {
    let cancelled = false
    loadLocalDevAuth().then((enabled) => {
      if (cancelled) return
      setLocalDev(enabled)
      const savedUser = enabled ? localDevUser() : undefined
      setDevUser(savedUser)
      if (enabled && !savedUser?.id) {
        setGate('auth')
        return
      }
      return loadProfileBundle().then(() => {
        if (!cancelled) setGate('allowed')
      }).catch((error) => {
        if (!cancelled) setGate(error instanceof ApiError && error.status === 403 && error.detail === 'access_code_required' ? 'access' : 'auth')
      })
    }).catch(() => { if (!cancelled) setGate('auth') })
    return () => { cancelled = true }
  }, [])
  if (localDev && !devUser?.id) return <LocalDevLogin onLogin={(user) => { localStorage.setItem(LOCAL_DEV_USER_KEY, JSON.stringify(user)); setDevUser(user); setGate('checking'); void loadProfileBundle().then(() => setGate('allowed')).catch(() => setGate('auth')) }} />
  if (gate === 'checking') return null
  if (gate !== 'allowed') return <AccessGate accessCode={gate === 'access'} />
  return <BrowserRouter><AttendanceProvider><UserPreferencesProvider><ApplyProfileLocale /><GeolocationProvider><ReviewsProvider><Routes>
    <Route path="/" element={<HomePage />} /><Route path="/nearby" element={<NearbySearchPage />} /><Route path="/catalog" element={<CatalogPage />} /><Route path="/map" element={<MapPage />} /><Route path="/chat" element={<ChatPage />} /><Route path="/plans" element={<PlansPage />} /><Route path="/plans/requests/:requestId" element={<RequestDetailPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="/events/create" element={<CreateEventPage />} /><Route path="/events/:eventId" element={<EventDetailsPage />} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></ReviewsProvider></GeolocationProvider></UserPreferencesProvider></AttendanceProvider></BrowserRouter>
}
export default function App() { return <AppContent /> }
