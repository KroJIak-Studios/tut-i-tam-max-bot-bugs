import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './components/HomePage'
import { MapPage } from './components/Map/MapPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

