import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AttendanceProvider } from './context/AttendanceContext'
import { UserPreferencesProvider } from './context/UserPreferencesContext'
import { ReviewsProvider } from './context/ReviewsContext'
import { apiRequest, isAccessCodeRequired } from './services/api'
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

function AccessGate() {
  const { i18n } = useTranslation()
  return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>{i18n.language.startsWith('en') ? 'Enter the access code in the bot' : 'Введите контрольное слово в боте'}</div>
}

function AppContent() {
  const [blocked, setBlocked] = useState(false)
  useEffect(() => { apiRequest('/me').catch((error) => { if (isAccessCodeRequired(error)) setBlocked(true) }) }, [])
  if (blocked) return <AccessGate />
  return <BrowserRouter><AttendanceProvider><UserPreferencesProvider><ReviewsProvider><Routes>
    <Route path="/" element={<HomePage />} /><Route path="/catalog" element={<CatalogPage />} /><Route path="/map" element={<MapPage />} /><Route path="/chat" element={<ChatPage />} /><Route path="/plans" element={<PlansPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="/profile/requests" element={<UserRequestsPage />} /><Route path="/profile/requests/:requestId" element={<RequestDetailPage />} /><Route path="/events/create" element={<CreateEventPage />} /><Route path="/events/:eventId" element={<EventDetailsPage />} /><Route path="*" element={<Navigate to="/" replace />} />
  </Routes></ReviewsProvider></UserPreferencesProvider></AttendanceProvider></BrowserRouter>
}
export default function App() { return <AppContent /> }
