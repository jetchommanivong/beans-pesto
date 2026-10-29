import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { Footprints, MapPin, Route } from 'lucide-react'
import useWalks from '../hooks/useWalks.js'
import WalkPage from '../pages/WalkPage.jsx'
import LiveLocationControl from './LiveLocationControl.jsx'
import './Walks.css'

export default function ActiveWalkBanner() {
  const { draft, sharingActive } = useWalks()
  const controlsRef = useRef(null)
  const location = useLocation()
  const walkStatus = !draft ? 'No active walk' : draft.phase === 'recording' ? 'Walking' : draft.phase === 'paused' ? 'Walk paused' : 'Walk ready to save'
  const walkLabel = `${walkStatus}. Route recording ${draft?.recordRoute ? 'on' : 'off'}`

  useEffect(() => {
    function dismiss(event) {
      for (const dropdown of controlsRef.current?.querySelectorAll('details[open]') ?? []) {
        if (event.key === 'Escape' || !dropdown.contains(event.target)) dropdown.open = false
      }
    }
    const escape = (event) => { if (event.key === 'Escape') dismiss(event) }
    document.addEventListener('pointerdown', dismiss, true)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', dismiss, true)
      document.removeEventListener('keydown', escape)
    }
  }, [])

  useEffect(() => {
    for (const dropdown of controlsRef.current?.querySelectorAll('details[open]') ?? []) dropdown.open = false
  }, [location.key])

  function closeOnLink(event) {
    if (event.target.closest('a')) event.currentTarget.closest('details').open = false
  }
  return <div className="header-actions" ref={controlsRef}>
    <details className="header-walk" name="header-controls" key={draft?.id ?? 'idle'}>
      <summary className={`header-walk__indicator${!draft || draft.phase !== 'recording' ? ' header-walk__indicator--idle' : ''}`} aria-label={walkLabel} title={walkLabel}>
        <Footprints size={18} aria-hidden="true" />
        {draft?.recordRoute && <Route size={16} aria-hidden="true" />}
      </summary>
      <div className="header-walk__dropdown" onClick={closeOnLink}><WalkPage /></div>
    </details>
    <details className="header-live" name="header-controls">
      <summary className={`header-walk__indicator header-live__indicator${sharingActive ? ' header-live__indicator--on' : ''}`} aria-label={sharingActive ? 'Live location: sharing with friends' : 'Live location: off'} title="Live location">
        <MapPin size={18} aria-hidden="true" />
        {sharingActive && <span className="live-location-dot" />}
      </summary>
      <div className="header-walk__dropdown" onClick={closeOnLink}><LiveLocationControl /></div>
    </details>
  </div>
}
