import { Link, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, PawPrint } from 'lucide-react'
import ActiveWalkBanner from './ActiveWalkBanner.jsx'
import './Header.css'
import './HeaderBack.css'

// `showBack` is turned on for every screen that has no bottom navigation, so
// no sub-page can leave someone stranded.
export default function Header({ showBack = false, showWalkIndicator = true }) {
  const navigate = useNavigate()
  const location = useLocation()

  function goBack() {
    // "default" means this was the first page opened, so there is nothing to go back to.
    if (location.key === 'default') navigate('/')
    else navigate(-1)
  }

  return (
    <header className="app-header">
      {showBack && (
        <button type="button" className="app-header__back" onClick={goBack} aria-label="Go back">
          <ArrowLeft size={22} strokeWidth={2.25} aria-hidden="true" />
        </button>
      )}
      <Link to="/" className="app-header__logo">
        <PawPrint size={22} strokeWidth={2.25} aria-hidden="true" />
        Tail Mates
      </Link>
      {showWalkIndicator && <ActiveWalkBanner />}
    </header>
  )
}
