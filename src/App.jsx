import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout.jsx'
import ProfileProvider from './components/ProfileProvider.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import LocationProvider from './components/LocationProvider.jsx'
import HomePage from './pages/HomePage.jsx'
import MapPage from './pages/MapPage.jsx'
import SocialPage from './pages/SocialPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import EditProfilePage from './pages/EditProfilePage.jsx'
import AccountPrivacyPage from './pages/AccountPrivacyPage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import LoadingScreen from './pages/LoadingScreen.jsx'
import UnderConstructionPage from './pages/UnderConstructionPage.jsx'
import useSocialState from './hooks/useSocialState.js'
import OwnerProfilePage from './pages/OwnerProfilePage.jsx'
import WalkProvider from './components/WalkProvider.jsx'
import WalkDetailPage from './pages/WalkDetailPage.jsx'

// How long the splash screen shows when the app first opens.
const LOADING_DURATION_MS = 1200
const LOADING_TICK_MS = 50

export default function App() {
  const social = useSocialState()
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
      <ProfileProvider>
      <WalkProvider>
      <Routes>
        {/* Main screens: header + bottom navigation */}
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="map" element={<MapPage />} />
          <Route path="social" element={<SocialPage {...social} />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Sub-pages: no bottom navigation, so the header shows a back button */}
        <Route element={<AppLayout showNav={false} />}>
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
          <Route path="profile/privacy" element={<AccountPrivacyPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="social/chat/:chatId" element={<ChatPage onOpenChat={social.openChat} />} />
          <Route path="social/people/:ownerId" element={<OwnerProfilePage followedIds={social.followedIds} toggleFollow={social.toggleFollow} />} />
          <Route path="walk" element={<Navigate to="/map" replace />} />
          <Route path="walks/:walkId" element={<WalkDetailPage followingOwnerIds={social.followedIds} />} />
          {/* Only reached by a mistyped address; nothing in the app links here. */}
          <Route path="*" element={<UnderConstructionPage />} />
        </Route>
      </Routes>
      </WalkProvider>
      </ProfileProvider>
    </LocationProvider>
  )
}
