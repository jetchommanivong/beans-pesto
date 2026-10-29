import { Link, Outlet } from 'react-router'
import { Info } from 'lucide-react'
import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'
import './AppLayout.css'

// Wraps every screen. Renders `children` if given, otherwise the matched route.
// Screens without the bottom navigation are sub-pages, so they get a back button.
export default function AppLayout({ showNav = true, showWalkBanner = true, children }) {
  return (
    <div className={`app-shell ${showNav ? '' : 'app-shell--no-nav'}`}>
      <Header showBack={!showNav} showWalkIndicator={showWalkBanner} />
      <main className="app-main">{children ?? <Outlet />}</main>
      <footer className="app-footer">
        <Link to="/about" className="app-footer__about"><Info size={15} aria-hidden="true" />About Tail Mates</Link>
      </footer>
      {showNav && <BottomNav />}
    </div>
  )
}
