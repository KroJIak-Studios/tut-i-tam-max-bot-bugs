import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './components/Layout/AdminLayout'
import { RequestsListPage } from './components/Requests/RequestsListPage'
import { RequestDetailPage } from './components/Requests/RequestDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/requests" replace />} />
          <Route path="/requests" element={<RequestsListPage />} />
          <Route path="/requests/:requestId" element={<RequestDetailPage />} />
          <Route path="*" element={<Navigate to="/requests" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
