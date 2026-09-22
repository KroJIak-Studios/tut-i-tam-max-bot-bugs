import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AttendanceProvider } from './context/AttendanceContext'
import { HomePage } from './components/HomePage'
import { MapPage } from './components/Map/MapPage'
import { ChatPage } from './components/Chat/ChatPage'
import { PlansPage } from './components/Plans/PlansPage'

export default function App() {
  return (
    <BrowserRouter>
      <AttendanceProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AttendanceProvider>
    </BrowserRouter>
  )
}

