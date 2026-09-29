import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/Auth/ProtectedRoute'
import { LoginPage } from './components/Auth/LoginPage'
import { AdminLayout } from './components/Layout/AdminLayout'
import { RequestsListPage } from './components/Requests/RequestsListPage'
import { RequestDetailPage } from './components/Requests/RequestDetailPage'
import { SectionPlaceholder } from './components/Placeholder/SectionPlaceholder'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/requests" replace />} />
              <Route path="/requests" element={<RequestsListPage />} />
              <Route path="/requests/:requestId" element={<RequestDetailPage />} />

              <Route
                path="/categories"
                element={
                  <SectionPlaceholder
                    title="Категории мероприятий"
                    description="Справочник категорий событий с мультиязычными названиями."
                    apiStatus="ready"
                    endpoints={[
                      'GET /api/admin/event-categories',
                      'POST /api/admin/event-categories',
                      'PATCH /api/admin/event-categories/{category_id}',
                      'DELETE /api/admin/event-categories/{category_id}',
                    ]}
                    notes="Backend API для категорий полностью реализован. Раздел готов к разработке CRUD-экрана в следующей изолированной итерации."
                  />
                }
              />

              <Route
                path="/cities"
                element={
                  <SectionPlaceholder
                    title="Города"
                    description="Справочник доступных городов с мультиязычными названиями и географическими координатами центра."
                    apiStatus="pending_backend"
                    endpoints={[
                      'GET /api/admin/cities',
                      'POST /api/admin/cities',
                      'PATCH /api/admin/cities/{city_id}',
                    ]}
                    notes="В ответе GET /api/admin/cities сейчас отсутствуют поля latitude и longitude, а также нет DELETE эндпоинта. Ожидает исправления на бэкенде (API Gap)."
                  />
                }
              />

              <Route
                path="/interests"
                element={
                  <SectionPlaceholder
                    title="Интересы"
                    description="Справочник интересов пользователей с мультиязычными названиями и цветовым кодом плашки."
                    apiStatus="pending_backend"
                    endpoints={[
                      'GET /api/admin/interests',
                      'POST /api/admin/interests',
                      'PATCH /api/admin/interests/{interest_id}',
                    ]}
                    notes="В схеме ответа GET /api/admin/interests сейчас отсутствует поле color, и создание не принимает цвет от клиента. Ожидает исправления на бэкенде (API Gap)."
                  />
                }
              />

              <Route
                path="/events"
                element={
                  <SectionPlaceholder
                    title="Мероприятия"
                    description="Административное управление мероприятиями, расписанием и привязкой к чатам MAX."
                    apiStatus="pending_backend"
                    endpoints={[
                      'GET /api/admin/events',
                      'POST /api/admin/events',
                      'PATCH /api/admin/events/{event_id}',
                      'DELETE /api/admin/events/{event_id}',
                    ]}
                    notes="Админский CRUD для мероприятий и статусная модель модерации пользовательских заявок пока отсутствуют на бэкенде (API Gap)."
                  />
                }
              />

              <Route path="*" element={<Navigate to="/requests" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
