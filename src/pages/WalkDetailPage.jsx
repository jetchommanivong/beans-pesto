import { useEffect, useId, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Check, LockKeyhole, Trash2, UserRound, Users } from 'lucide-react'
import WalkMap from '../components/WalkMap.jsx'
import WalkStats from '../components/WalkStats.jsx'
import useWalks from '../hooks/useWalks.js'
import { canViewWalk } from '../data/walkData.js'
import { allChats, owners } from '../data/mockData.js'
import '../components/Walks.css'

export default function WalkDetailPage({ followingOwnerIds = [] }) {
  const { walkId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const id = useId()
  const { walks, notice, deleteWalk, changeVisibility } = useWalks()
  const [deleting, setDeleting] = useState(false)
  const walk = walks.find((item) => item.id === walkId)
  const chat = allChats.find((item) => item.id === params.get('chat'))
  const allowed = canViewWalk(walk, {
    followingOwnerIds,
    chatId: chat?.id,
    chatMemberIds: chat ? ['me', ...(chat.isGroup ? chat.memberIds : [chat.ownerId])] : [],
  })

  useEffect(() => { window.scrollTo(0, 0) }, [walkId])

  if (!allowed) return <div className="walk-page"><h1>Walk unavailable</h1><p>This walk is private or has been deleted.</p></div>
  const isOwner = walk.ownerId === 'me'
  const owner = owners.find((person) => person.id === walk.ownerId)

  return (
    <div className="walk-page">
      <header className="walk-detail-heading">
        <h1>{walk.title}</h1>
        {isOwner && <span className={`walk-card__visibility walk-card__visibility--${walk.visibility}`}>
          {walk.visibility === 'private' ? <LockKeyhole size={14} aria-hidden="true" /> : <Users size={14} aria-hidden="true" />}
          {walk.visibility === 'private' ? 'Private · Only you' : 'Followers only'}
        </span>}
        {owner && <Link to={`/social/people/${owner.id}`} className="walk-owner-link"><UserRound size={15} aria-hidden="true" />{owner.name}</Link>}
        <p className="walk-note">{new Date(walk.startedAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      </header>
      {notice && <p className="walk-notice" role="alert">{notice}</p>}
      {walk.points.length ? <WalkMap points={walk.points} /> : <p className="walk-empty">No route recorded.</p>}
      <WalkStats points={walk.points} elapsedMs={walk.elapsedMs} />
      {isOwner ? <section className="walk-panel walk-save walk-saved-controls" aria-label="Saved walk options">
        <fieldset className="walk-privacy" aria-label="Walk visibility">
          <label><input type="radio" name={`${id}-visibility`} value="private" checked={walk.visibility === 'private'} onChange={() => changeVisibility(walk.id, 'private')} /><LockKeyhole size={18} aria-hidden="true" /><span>Private</span></label>
          <label><input type="radio" name={`${id}-visibility`} value="followers" checked={walk.visibility === 'followers'} onChange={() => changeVisibility(walk.id, 'followers')} /><Users size={18} aria-hidden="true" /><span>Followers</span></label>
        </fieldset>
        <div className="walk-actions walk-actions--utility">
          <button type="button" className="button walk-button--danger-soft" onClick={() => setDeleting(true)}><Trash2 size={18} aria-hidden="true" />Delete walk</button>
        </div>
        {deleting && <div className="walk-confirm" role="alert"><p>Delete this walk? Shared links will stop working.</p>
          <div className="walk-actions">
            <button type="button" className="button button--secondary" onClick={() => setDeleting(false)}><Check size={18} aria-hidden="true" />Keep walk</button>
            <button type="button" className="button walk-button--danger" onClick={() => { if (deleteWalk(walk.id)) navigate('/profile', { replace: true }) }}><Trash2 size={18} aria-hidden="true" />Delete walk</button>
          </div>
        </div>}
      </section> : <p className="walk-note walk-visibility-label">{walk.visibility === 'private' ? <LockKeyhole size={14} aria-hidden="true" /> : <Users size={14} aria-hidden="true" />}{walk.visibility === 'private' ? 'Shared in this chat' : 'Shared with followers'}</p>}
    </div>
  )
}
