import { useEffect, useId, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { AlertTriangle, Check, Footprints, LockKeyhole, Map, Pause, Play, Route, Save, Square, Trash2, Users } from 'lucide-react'
import useWalks from '../hooks/useWalks.js'
import WalkStats from '../components/WalkStats.jsx'
import { elapsedWalk, formatWalkDistance, formatWalkDuration, walkDistance, walkPauseMessage } from '../data/walkData.js'
import '../components/Walks.css'

export default function WalkPage({ openMapOnStart = false }) {
  const walks = useWalks()
  const { draft, gps, notice } = walks
  const navigate = useNavigate()
  const id = useId()
  const [now, setNow] = useState(Date.now)
  const [recordRoute, setRecordRoute] = useState(false)
  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [confirmDiscard, setConfirmDiscard] = useState(false)

  useEffect(() => {
    if (draft?.phase !== 'recording') return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [draft?.phase])

  function save(event) {
    event.preventDefault()
    const walk = walks.save(title, visibility)
    if (walk) navigate(`/walks/${walk.id}`, { replace: true })
  }

  const reviewing = draft?.phase === 'review'
  const recordingRoute = draft ? draft.recordRoute !== false : recordRoute
  const hasRoute = draft && (recordingRoute || draft.points.length > 0 || reviewing)
  const locationIssue = draft && !reviewing && recordingRoute && (gps.status === 'error' || draft.pauseReason === 'location-denied')
  const pauseMessage = walkPauseMessage(draft)
  return (
    <section className="walk-page walk-panel" aria-label="Walk controls">
      <header className="walk-heading">
        <h2>{reviewing ? 'Save your walk?' : draft ? 'Your walk' : 'Ready to head out?'}</h2>
        {draft && <span className={`walk-status ${draft.phase === 'recording' ? 'walk-status--active' : ''}`}>
          {reviewing ? 'Finished' : draft.phase === 'paused' ? 'Paused' : 'Walking'}
        </span>}
      </header>
      {notice && <p className="walk-notice" role="alert">{notice}</p>}
      {!reviewing && <button type="button" role="switch" aria-checked={recordingRoute} className="walk-record-toggle"
        onClick={() => draft ? walks.setRecording(!recordingRoute) : setRecordRoute(!recordRoute)}>
        <span className="walk-feature-icon"><Route size={21} aria-hidden="true" /></span>
        <span className="walk-record-toggle__label"><strong>Record route</strong><small>{recordingRoute ? 'On · private until shared' : draft?.points.length ? 'Off · recorded route kept' : 'Off · time only'}</small></span>
        <span className="walk-switch-track" aria-hidden="true"><span /></span>
      </button>}
      {!draft ? <button type="button" className="button button--primary" onClick={() => {
        setTitle(''); setVisibility('private'); setConfirmDiscard(false)
        if (walks.start({ recordRoute }) && openMapOnStart) navigate('/map')
      }}><Footprints size={18} aria-hidden="true" />Start walk</button> : <>
        {hasRoute ? <WalkStats points={draft.points} elapsedMs={elapsedWalk(draft, now)} /> :
          <p className="walk-timer" aria-label="Walking time">{formatWalkDuration(elapsedWalk(draft, now))}</p>}
        {locationIssue ? <div className="walk-location-notice" role="alert">
          <p><AlertTriangle size={18} aria-hidden="true" />{pauseMessage || gps.message}</p>
          <button type="button" className="button button--secondary" onClick={() => { walks.setRecording(false); walks.resume() }}><Footprints size={18} aria-hidden="true" />Continue without route</button>
        </div> : pauseMessage ? <p className="walk-note" role="status">{pauseMessage}</p> : recordingRoute && !reviewing && (gps.message || gps.status === 'waiting') ? <p className="walk-note" role="status">{gps.message || 'Finding your location…'}</p> : null}
        {reviewing ? <form className="walk-save" onSubmit={save}>
          <label className="walk-title-label" htmlFor={`${id}-title`}>Walk name<input id={`${id}-title`} value={title} maxLength={80} placeholder="A walk with my dog" onChange={(event) => setTitle(event.target.value)} /></label>
          <fieldset className="walk-privacy" aria-label="Walk visibility">
            <label><input type="radio" name={`${id}-visibility`} value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} /><LockKeyhole size={18} aria-hidden="true" /><span>Private</span></label>
            <label><input type="radio" name={`${id}-visibility`} value="followers" checked={visibility === 'followers'} onChange={() => setVisibility('followers')} /><Users size={18} aria-hidden="true" /><span>Followers</span></label>
          </fieldset>
          <p className="walk-note">Shared routes include your start and finish.</p>
          <button type="submit" className="button button--primary"><Save size={18} aria-hidden="true" />{visibility === 'followers' ? 'Publish to followers' : 'Save privately'}</button>
          <button type="button" className="button button--secondary" onClick={walks.resume}><Play size={18} aria-hidden="true" />Continue walking</button>
        </form> : <div className="walk-actions">
          <button type="button" className="button button--secondary" onClick={draft.phase === 'recording' ? walks.pause : walks.resume}>
            {draft.phase === 'recording' ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}{draft.phase === 'recording' ? 'Pause' : 'Resume'}
          </button>
          <button type="button" className="button button--primary" onClick={walks.finish}><Square size={16} aria-hidden="true" />Finish</button>
        </div>}
        <div className="walk-actions walk-actions--utility">
          <Link to="/map" className="button button--secondary"><Map size={18} aria-hidden="true" />Map</Link>
          <button type="button" className="button walk-button--danger-soft" onClick={() => setConfirmDiscard(true)}><Trash2 size={18} aria-hidden="true" />Discard walk</button>
        </div>
        {confirmDiscard && <div className="walk-confirm" role="alert">
          <p>Discard this walk{draft.points.length ? ' and its route' : ''}?</p>
          <div className="walk-actions"><button type="button" className="button button--secondary" onClick={() => setConfirmDiscard(false)}><Check size={18} aria-hidden="true" />Keep walk</button>
            <button type="button" className="button walk-button--danger" onClick={() => { walks.discard(); setConfirmDiscard(false) }}><Trash2 size={18} aria-hidden="true" />Discard</button></div>
        </div>}
      </>}
    </section>
  )
}

export function WalkPreview() {
  const { draft, gps } = useWalks()
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (draft?.phase !== 'recording') return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [draft?.phase])
  if (!draft) return null
  return <p className="walk-preview" role="status">
    <Footprints size={16} aria-hidden="true" />
    <span>{draft.phase === 'recording' ? 'Walking' : draft.phase === 'paused' ? 'Paused' : 'Finished'} · {formatWalkDuration(elapsedWalk(draft, now))}
      {(draft.recordRoute || draft.points.length > 0) && ` · ${formatWalkDistance(walkDistance(draft.points))}`}
      {draft.recordRoute && (draft.pauseReason === 'location-denied' || gps.status === 'error') && ' · Location issue'}
    </span>
  </p>
}
