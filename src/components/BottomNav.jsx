import { NavLink } from 'react-router'
import { House, MapPin, Users, Dog } from 'lucide-react'
import './BottomNav.css'

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: House },
  { to: '/map', label: 'Map', icon: MapPin },
  { to: '/social', label: 'Social', icon: Users },
  { to: '/profile', label: 'Profile', icon: Dog },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className="bottom-nav__link">
          <Icon size={22} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
