import { Link, useLocation } from 'react-router'
import { Footprints } from 'lucide-react'
import useWalks from '../hooks/useWalks.js'
import './Walks.css'

export default function ActiveWalkBanner() {
  const { draft } = useWalks()
  const { pathname } = useLocation()
  if (!draft || pathname === '/walk') return null
  return <Link to="/walk" className="active-walk-banner"><Footprints size={18} aria-hidden="true" />
    {draft.phase === 'recording' ? 'Walk recording · Return to walk' : draft.phase === 'review' ? 'Your walk is ready to save' : 'Paused walk · Return to walk'}
  </Link>
}
