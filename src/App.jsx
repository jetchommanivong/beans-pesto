import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout.jsx'
import LocationProvider from './components/LocationProvider.jsx'
import HomePage from './pages/HomePage.jsx'
import MapPage from './pages/MapPage.jsx'
import SocialPage from './pages/SocialPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AccountPrivacyPage from './pages/AccountPrivacyPage.jsx'
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
    <LocationProvider>
      <Routes>
        {/* Main screens: header + bottom navigation */}
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="social" element={<SocialPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Sub-pages: no bottom navigation, so the header shows a back button */}
        <Route element={<AppLayout showNav={false} />}>
          <Route path="profile/privacy" element={<AccountPrivacyPage />} />
          <Route path="social/chat/:chatId" element={<ChatPage />} />
          {/* Only reached by a mistyped address; nothing in the app links here. */}
          <Route path="*" element={<UnderConstructionPage />} />
        </Route>
      </Routes>
    </LocationProvider>
  )
}
