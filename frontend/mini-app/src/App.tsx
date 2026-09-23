import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AttendanceProvider } from './context/AttendanceContext'
import { UserPreferencesProvider } from './context/UserPreferencesContext'
import { ReviewsProvider } from './context/ReviewsContext'
import { HomePage } from './components/HomePage'
import { MapPage } from './components/Map/MapPage'
import { ChatPage } from './components/Chat/ChatPage'
import { PlansPage } from './components/Plans/PlansPage'
import { ProfilePage } from './components/Profile/ProfilePage'
import { CatalogPage } from './components/Catalog/CatalogPage'
import { EventDetailsPage } from './components/Event/EventDetailsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AttendanceProvider>
        <UserPreferencesProvider>
          <ReviewsProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/events/:eventId" element={<EventDetailsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ReviewsProvider>
        </UserPreferencesProvider>
      </AttendanceProvider>
    </BrowserRouter>
  )
}

