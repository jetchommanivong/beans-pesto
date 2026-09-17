import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout.jsx'
import HomePage from './pages/HomePage.jsx'
import MapPage from './pages/MapPage.jsx'
import SocialPage from './pages/SocialPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import LoadingScreen from './pages/LoadingScreen.jsx'
import UnderConstructionPage from './pages/UnderConstructionPage.jsx'

// How long the splash screen shows when the app first opens.
const LOADING_DURATION_MS = 1200
const LOADING_TICK_MS = 50

export default function App() {
  const [progress, setProgress] = useState(0)
  const isLoading = progress < 100

  useEffect(() => {
    if (!isLoading) return

    const startedAt = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt
      setProgress(Math.min(100, (elapsed / LOADING_DURATION_MS) * 100))
    }, LOADING_TICK_MS)

    return () => clearInterval(timer)
  }, [isLoading])

  if (isLoading) {
    return <LoadingScreen progress={progress} />
  }

  return (
    <Routes>
      {/* Main screens: header + bottom navigation */}
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="social" element={<SocialPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Screens without the bottom navigation */}
      <Route element={<AppLayout showNav={false} />}>
        <Route path="coming-soon" element={<UnderConstructionPage />} />
        <Route path="*" element={<UnderConstructionPage />} />
      </Route>
    </Routes>
  )
}
