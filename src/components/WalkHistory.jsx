import { useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, Footprints, Lock, Users } from 'lucide-react'
import useWalks from '../hooks/useWalks.js'
import { canViewWalk, formatWalkDistance, formatWalkDuration, walkDistance } from '../data/walkData.js'
import './Walks.css'

export function WalkCard({ walk }) {
  const isPrivate = walk.visibility === 'private'
  return (
    <li>
      <Link className={`walk-card${isPrivate ? ' walk-card--private' : ''}`} to={`/walks/${walk.id}`}>
        <Footprints size={24} aria-hidden="true" />
        <span className="walk-card__text">
          <strong>{walk.title}</strong>
          <span>{new Date(walk.startedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span>{formatWalkDistance(walkDistance(walk.points))} · {formatWalkDuration(walk.elapsedMs)}</span>
          <span className={`walk-card__visibility walk-card__visibility--${walk.visibility}`}>
            {isPrivate ? <Lock size={13} aria-hidden="true" /> : <Users size={13} aria-hidden="true" />}
            {isPrivate ? 'Private · Only you' : 'Followers only'}
          </span>
        </span>
        <ChevronRight size={18} aria-hidden="true" />
      </Link>
    </li>
  )
}

export default function WalkHistory({ ownerId = 'me', followingOwnerIds = [] }) {
  const { walks } = useWalks()
  const [filter, setFilter] = useState('all')
  const visible = walks.filter((walk) => walk.ownerId === ownerId && canViewWalk(walk, { followingOwnerIds }) &&
    (ownerId !== 'me' || filter === 'all' || filter === walk.visibility),
  ).sort((a, b) => b.startedAt - a.startedAt)

  return (
    <section className="walk-history" aria-label="Walk history">
      <h2>Walk history</h2>
      {ownerId === 'me' && <div className="walk-history__filters" role="group" aria-label="Filter walk history">
        <button type="button" className="walk-history__filter walk-history__filter--all" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All</button>
        <button type="button" className="walk-history__filter walk-history__filter--private" aria-pressed={filter === 'private'} onClick={() => setFilter('private')}><Lock size={15} aria-hidden="true" />Private</button>
        <button type="button" className="walk-history__filter walk-history__filter--followers" aria-pressed={filter === 'followers'} onClick={() => setFilter('followers')}><Users size={15} aria-hidden="true" />Followers</button>
      </div>}
      {visible.length ? <ul className="list">{visible.map((walk) => <WalkCard key={walk.id} walk={walk} />)}</ul>
        : <p className="walk-empty">{ownerId !== 'me' ? 'No walks shared with followers yet.' : filter === 'all' ? 'Your saved walks will appear here.' : 'No walks match this filter.'}</p>}
    </section>
  )
}
