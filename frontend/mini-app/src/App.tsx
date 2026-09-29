import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AttendanceProvider } from './context/AttendanceContext'
import { UserPreferencesProvider } from './context/UserPreferencesContext'
import { ReviewsProvider } from './context/ReviewsContext'
import { apiRequest, ApiError, loadLocalDevAuth, localDevUser } from './services/api'
import { GeolocationProvider } from './context/GeolocationContext'
import { HomePage } from './components/HomePage'
import { MapPage } from './components/Map/MapPage'
import { ChatPage } from './components/Chat/ChatPage'
import { PlansPage } from './components/Plans/PlansPage'
import { ProfilePage } from './components/Profile/ProfilePage'
import { CatalogPage } from './components/Catalog/CatalogPage'
import { EventDetailsPage } from './components/Event/EventDetailsPage'
import { CreateEventPage } from './components/CreateEvent/CreateEventPage'
import { UserRequestsPage } from './components/Profile/Requests/UserRequestsPage'
import { RequestDetailPage } from './components/Profile/Requests/RequestDetailPage'
import { LocalDevLogin } from './components/LocalDevLogin'

const LOCAL_DEV_USER_KEY = 'tut_i_tam_dev_user'

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
      if (enabled && savedUser?.id) {
        setGate('allowed')
        return
      }
      if (enabled) {
        setGate('auth')
        return
      }
      return apiRequest('/me').then(() => {
        if (!cancelled) setGate('allowed')
      }).catch((error) => {
        if (!cancelled) setGate(error instanceof ApiError && error.status === 403 && error.detail === 'access_code_required' ? 'access' : 'auth')
      })
    }).catch(() => { if (!cancelled) setGate('auth') })
    return () => { cancelled = true }
  }, [])
  if (localDev && !devUser?.id) return <LocalDevLogin onLogin={(user) => { localStorage.setItem(LOCAL_DEV_USER_KEY, JSON.stringify(user)); setDevUser(user); setGate('allowed') }} />
  if (gate === 'checking') return null
  if (gate !== 'allowed') return <AccessGate accessCode={gate === 'access'} />
  return <BrowserRouter><AttendanceProvider><UserPreferencesProvider><GeolocationProvider><ReviewsProvider><Routes>
    <Route path="/" element={<HomePage />} /><Route path="/catalog" element={<CatalogPage />} /><Route path="/map" element={<MapPage />} /><Route path="/chat" element={<ChatPage />} /><Route path="/plans" element={<PlansPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="/profile/requests" element={<UserRequestsPage />} /><Route path="/profile/requests/:requestId" element={<RequestDetailPage />} /><Route path="/events/create" element={<CreateEventPage />} /><Route path="/events/:eventId" element={<EventDetailsPage />} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></ReviewsProvider></GeolocationProvider></UserPreferencesProvider></AttendanceProvider></BrowserRouter>
}
export default function App() { return <AppContent /> }
