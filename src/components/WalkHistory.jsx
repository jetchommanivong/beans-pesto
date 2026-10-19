import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, Footprints, Lock, Users } from 'lucide-react'
import useWalks from '../hooks/useWalks.js'
import { canViewWalk, formatWalkDistance, formatWalkDuration, walkDistance } from '../data/walkData.js'
import './Walks.css'

export function WalkCard({ walk, followerView = false }) {
  return (
    <li>
      <Link className="walk-card" to={`/walks/${walk.id}${followerView ? '?view=follower' : ''}`}>
        <Footprints size={24} aria-hidden="true" />
        <span className="walk-card__text">
          <strong>{walk.title}</strong>
          <span>{new Date(walk.startedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>{formatWalkDistance(walkDistance(walk.points))} · {formatWalkDuration(walk.elapsedMs)}</span>
          <span className="walk-card__visibility">
            {walk.visibility === 'private' ? <Lock size={12} aria-hidden="true" /> : <Users size={12} aria-hidden="true" />}
            {walk.visibility === 'private' ? 'Private' : 'Followers'}
          </span>
        </span>
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </li>
  )
}

export default function WalkHistory({ ownerId = 'me', followingOwnerIds = [] }) {
  const { walks } = useWalks()
  const [followerView, setFollowerView] = useState(false)
  const visible = walks.filter((walk) => walk.ownerId === ownerId && canViewWalk(walk, {
    viewerId: followerView ? 'follower-preview' : 'me',
    followingOwnerIds: followerView ? ['me'] : followingOwnerIds,
  })).sort((a, b) => b.startedAt - a.startedAt)

  return (
    <section className="walk-history" aria-label="Walk history">
      <div className="walk-history__heading">
        <h2>Walk history</h2>
        {ownerId === 'me' && <button type="button" className="walk-text-button" aria-pressed={followerView} onClick={() => setFollowerView(!followerView)}>
          {followerView ? 'Your view' : 'Preview follower view'}
        </button>}
      </div>
      {followerView && <p className="walk-note">Only walks shared with followers appear in this view.</p>}
      {visible.length ? <ul className="list">{visible.map((walk) => <WalkCard key={walk.id} walk={walk} followerView={followerView} />)}</ul>
        : <p className="walk-empty">{followerView || ownerId !== 'me' ? 'No walks shared with followers yet.' : 'Your saved walks will appear here.'}</p>}
      {ownerId === 'me' && <p className="walk-note">Walks and chat shares stay on this device in this prototype.</p>}
    </section>
  )
}
