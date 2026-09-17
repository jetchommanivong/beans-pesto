import { Outlet } from 'react-router'
import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'
import './AppLayout.css'

// Wraps every screen. Renders `children` if given, otherwise the matched route.
export default function AppLayout({ showNav = true, children }) {
  return (
    <div className={`app-shell ${showNav ? '' : 'app-shell--no-nav'}`}>
      <Header />
      <main className="app-main">{children ?? <Outlet />}</main>
      {showNav && <BottomNav />}
    </div>
  )
}
