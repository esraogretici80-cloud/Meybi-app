import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Lesson from './pages/Lesson'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import BottomNav from './components/BottomNav'
import { ThemeProvider } from './hooks/useTheme'
import { ProgressProvider } from './hooks/useProgress'

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  return (
    <ThemeProvider>
      <ProgressProvider>
        <div className="app">
          {!isOnline && (
            <div className="offline-banner">
              Çevrimdışısın. Yapay zekâ dersleri için internet gerekir.
            </div>
          )}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/lesson" element={<Lesson />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <BottomNav />
        </div>
      </ProgressProvider>
    </ThemeProvider>
  )
}
