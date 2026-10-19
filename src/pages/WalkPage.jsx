import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Footprints, Pause, Play, Square, Trash2 } from 'lucide-react'
import useWalks from '../hooks/useWalks.js'
import WalkMap from '../components/WalkMap.jsx'
import WalkStats from '../components/WalkStats.jsx'
import { elapsedWalk } from '../data/walkData.js'
import '../components/Walks.css'

export default function WalkPage() {
  const walks = useWalks()
  const { draft, gps, notice, screenAwake } = walks
  const navigate = useNavigate()
  const [now, setNow] = useState(Date.now)
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

  return (
    <div className={`walk-page${draft && draft.phase !== 'review' ? ' walk-page--recording' : ''}`}>
      <header className="walk-heading"><h1>{draft?.phase === 'review' ? 'Save your walk?' : 'Your walk'}</h1>
        {draft && <span className={`walk-status ${draft.phase === 'recording' ? 'walk-status--active' : ''}`}>{draft.phase === 'recording' ? 'Recording' : draft.phase === 'paused' ? 'Paused' : 'Finished'}</span>}
      </header>
      {notice && <p className="walk-notice" role="alert">{notice}</p>}
      {!draft ? (
        <section className="profile-panel">
          <h2>A little adventure, saved</h2>
          <p>Record your route, distance and walking time. Choose who can see it when you finish.</p>
          <button type="button" className="button button--primary" onClick={walks.start}><Footprints size={18} aria-hidden="true" />Start recording</button>
          <p className="walk-note">Allow precise location when your browser asks. Keep the app open and your screen awake; recording pauses when you leave the app.</p>
        </section>
      ) : (
        <>
          <WalkMap points={draft.points} recording={draft.phase === 'recording'} />
          <WalkStats points={draft.points} elapsedMs={elapsedWalk(draft, now)} />
          {draft.phase === 'recording' && <>
            <p className="walk-note" role="status">{gps.message || (gps.accuracy != null ? `GPS accuracy: about ${Math.round(gps.accuracy)} m.` : 'Waiting for your first GPS fix…')}</p>
            <p className="walk-note">{screenAwake ? 'Your screen is being kept awake. Keep this app open while walking.' : 'Keep the app open and your screen awake while walking.'} Recording pauses if you leave the app.</p>
          </>}
          {draft.phase === 'paused' && <p className="walk-note">{gps.message || 'Recording is paused. Resume when you are ready; pauses will not add to your distance or walking time.'}</p>}
          {draft.phase === 'review' ? (
            <form className="walk-save profile-panel" onSubmit={save}>
              <label htmlFor="walk-title">Walk name<input id="walk-title" value={title} maxLength={80} placeholder="A walk with my dog" onChange={(event) => setTitle(event.target.value)} /></label>
              <fieldset className="walk-privacy">
                <legend>Who can see this walk?</legend>
                <label><input type="radio" name="walk-visibility" value="private" checked={visibility === 'private'} onChange={() => setVisibility('private')} /><span><strong>Private</strong><small>Only in your own walk history.</small></span></label>
                <label><input type="radio" name="walk-visibility" value="followers" checked={visibility === 'followers'} onChange={() => setVisibility('followers')} /><span><strong>Followers</strong><small>Visible in your profile&apos;s follower view.</small></span></label>
              </fieldset>
              <p className="walk-note">Your full route includes your start and finish locations. Follower sharing is previewed on this device.</p>
              <button type="submit" className="button button--primary">{visibility === 'followers' ? 'Publish to followers' : 'Save privately'}</button>
              <button type="button" className="walk-text-button" onClick={walks.resume}>Continue walking</button>
            </form>
          ) : (
            <div className="walk-actions walk-recorder-actions">
              <button type="button" className="button button--secondary" onClick={draft.phase === 'recording' ? walks.pause : walks.resume}>
                {draft.phase === 'recording' ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}{draft.phase === 'recording' ? 'Pause' : 'Resume'}
              </button>
              <button type="button" className="button button--primary" onClick={walks.finish}><Square size={16} aria-hidden="true" />Finish</button>
            </div>
          )}
          {confirmDiscard ? <div className="walk-confirm" role="alert">
            <p>Discard this walk and its recorded route?</p>
            <div className="walk-actions"><button type="button" className="button button--secondary" onClick={() => setConfirmDiscard(false)}>Keep walk</button>
              <button type="button" className="button button--primary" onClick={() => { walks.pause(); if (walks.discard()) navigate('/', { replace: true }) }}>Discard walk</button></div>
          </div> : <button type="button" className="walk-text-button walk-delete" onClick={() => setConfirmDiscard(true)}><Trash2 size={16} aria-hidden="true" />Discard walk</button>}
        </>
      )}
      <Link className="walk-text-button" to="/profile">View walk history</Link>
    </div>
  )
}
