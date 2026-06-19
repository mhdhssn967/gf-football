import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoadingScreen } from '@/ui/components/LoadingScreen'
import './App.css'

// Lazy-loaded page components for efficient code splitting
const MainMenu = lazy(() => import('@/ui/pages/MainMenu'))
const GameScenePage = lazy(() => import('@/ui/pages/GameScenePage'))

function App() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [isAppLoaded, setIsAppLoaded] = useState(false)

  // Simulate initial game asset (3D engine, sounds, models) caching on app mount
  useEffect(() => {
    const duration = 2500 // 2.5 seconds total loading time
    const intervalTime = 50
    const steps = duration / intervalTime
    const increment = 100 / steps

    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          // Small delay after 100% to let player appreciate the loading transition
          setTimeout(() => setIsAppLoaded(true), 400)
          return 100
        }
        return next
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [])

  if (!isAppLoaded) {
    return <LoadingScreen progress={loadingProgress} />
  }

  return (
    <BrowserRouter>
      {/* Fallback loader handles lazy-loaded chunks transition */}
      <Suspense fallback={<LoadingScreen progress={90} />}>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/game" element={<GameScenePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
