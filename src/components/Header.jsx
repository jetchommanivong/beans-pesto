import { Link } from 'react-router'
import { PawPrint } from 'lucide-react'
import './Header.css'

export default function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__logo">
        <PawPrint size={22} strokeWidth={2.25} aria-hidden="true" />
        Tail Mates
      </Link>
    </header>
  )
}
