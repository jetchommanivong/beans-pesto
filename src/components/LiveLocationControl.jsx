import { Link } from 'react-router'
import { LockKeyhole, MapPin, Radio, Settings, Square, Users } from 'lucide-react'
import usePrivacySettings from '../hooks/usePrivacySettings.js'
import useWalks from '../hooks/useWalks.js'
import './Walks.css'

export default function LiveLocationControl() {
  const { settings } = usePrivacySettings()
  const { sharingActive, setLiveSharing } = useWalks()
  return <section className="walk-panel live-location" aria-label="Live location sharing">
    <div className="live-location__heading">
      <span className={`walk-feature-icon${sharingActive ? ' walk-feature-icon--live' : ''}`}><MapPin size={21} aria-hidden="true" /></span>
      <div><h2>Live location</h2><p><Users size={14} aria-hidden="true" />Friends only</p></div>
      <span className={`walk-status${sharingActive ? ' walk-status--active' : ''}`}>{sharingActive ? 'Sharing' : 'Off'}</span>
    </div>
    {settings.shareLocation ? <button type="button" className={`button ${sharingActive ? 'walk-button--danger-soft' : 'button--secondary'}`} onClick={() => setLiveSharing(!sharingActive)}>
      {sharingActive ? <Square size={16} aria-hidden="true" /> : <Radio size={18} aria-hidden="true" />}{sharingActive ? 'Stop sharing' : 'Share with friends'}
    </button> : <>
      <p className="walk-note"><LockKeyhole size={14} aria-hidden="true" />Disabled in Privacy</p>
      <Link className="button button--secondary" to="/profile/privacy"><Settings size={18} aria-hidden="true" />Privacy settings</Link>
    </>}
  </section>
}
