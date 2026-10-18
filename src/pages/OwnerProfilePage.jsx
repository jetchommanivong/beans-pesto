import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { Check, Send, UserPlus } from 'lucide-react'
import ProfileDetails from '../components/ProfileDetails.jsx'
import { getOwnerProfile, owners } from '../data/mockData.js'

export default function OwnerProfilePage({ followedIds, toggleFollow }) {
  const { ownerId } = useParams()
  const person = owners.find((owner) => owner.id === ownerId)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ownerId])

  if (!person) {
    return <p>We couldn&apos;t find that profile. <Link to="/social">Back to Social</Link></p>
  }

  const following = followedIds.includes(person.id)

  return (
    <div className="profile-overview">
      <header className="profile-overview__heading">
        <h1>{person.name}</h1>
      </header>
      <div className="profile-actions">
        <button
          type="button"
          className={`button ${following ? 'button--secondary' : 'button--primary'}`}
          aria-label={`${following ? 'Unfollow' : 'Follow'} ${person.name}`}
          aria-pressed={following}
          onClick={() => toggleFollow(person.id)}
        >
          {following ? <Check size={18} aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
          {following ? 'Following' : 'Follow'}
        </button>
        <Link to={`/social/chat/chat-${person.id}`} className="button button--primary">
          <Send size={18} aria-hidden="true" />
          Message
        </Link>
      </div>
      <ProfileDetails profile={getOwnerProfile(person)} dogsTitle="Dogs" />
    </div>
  )
}
