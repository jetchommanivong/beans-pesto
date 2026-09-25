import { Outlet } from 'react-router'
import { Sparkles } from 'lucide-react'
import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'
import './AppLayout.css'

// Wraps every screen. Renders `children` if given, otherwise the matched route.
export default function AppLayout({ showNav = true, children }) {
  return (
    <div className={`app-shell ${showNav ? '' : 'app-shell--no-nav'}`}>
      <Header />
      <main className="app-main">{children ?? <Outlet />}</main>
      <footer className="app-footer">
        <p className="app-footer__note">
          <span>
            Parts of this app were built with the assistance of AI tools. All generated code was
            reviewed and tested by the project team. More info can be disclosed after request.
          </span>
        </p>
      </footer>
      {showNav && <BottomNav />}
    </div>
  )
}
