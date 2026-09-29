import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { LoginPage } from './components/Auth/LoginPage'
import { AdminLayout } from './components/Layout/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { RequestsPage } from './pages/RequestsPage'
import { RequestDetailPage } from './pages/RequestDetailPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CitiesPage } from './pages/CitiesPage'
import { InterestsPage } from './pages/InterestsPage'
import { EventsPage } from './pages/EventsPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/requests/:requestId" element={<RequestDetailPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/cities" element={<CitiesPage />} />
              <Route path="/interests" element={<InterestsPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
