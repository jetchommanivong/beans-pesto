import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Lock, Send, Trash2, Users } from 'lucide-react'
import WalkMap from '../components/WalkMap.jsx'
import WalkStats from '../components/WalkStats.jsx'
import WalkSharePicker from '../components/WalkSharePicker.jsx'
import useWalks from '../hooks/useWalks.js'
import { canViewWalk } from '../data/walkData.js'
import { allChats } from '../data/mockData.js'
import '../components/Walks.css'

export default function WalkDetailPage({ followingOwnerIds = [] }) {
  const { walkId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { walks, notice, deleteWalk, changeVisibility, revokeShares, shareWalk } = useWalks()
  const [sharing, setSharing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const followerView = params.get('view') === 'follower'
  const walk = walks.find((item) => item.id === walkId)
  const chat = allChats.find((item) => item.id === params.get('chat'))
  const allowed = canViewWalk(walk, {
    viewerId: followerView ? 'follower-preview' : 'me',
    followingOwnerIds: followerView ? ['me'] : followingOwnerIds,
    chatId: followerView ? undefined : chat?.id,
    chatMemberIds: chat ? ['me', ...(chat.isGroup ? chat.memberIds : [chat.ownerId])] : [],
  })

  useEffect(() => { window.scrollTo(0, 0) }, [walkId])

  if (!allowed) return <div className="walk-page"><h1>Walk unavailable</h1><p>This walk is private or has been deleted.</p><Link to="/profile" className="walk-text-button">Back to profile</Link></div>
  const isOwner = walk.ownerId === 'me' && !followerView

  return (
    <div className="walk-page">
      <h1>{walk.title}</h1>
      <p className="walk-note">{new Date(walk.startedAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}</p>
      {followerView && <p className="walk-notice">Previewing the walk as a follower.</p>}
      {notice && <p className="walk-notice" role="alert">{notice}</p>}
      <WalkMap points={walk.points} />
      <WalkStats points={walk.points} elapsedMs={walk.elapsedMs} />
      {isOwner ? <>
        <label className="walk-visibility-select">Who can see this walk?
          <select value={walk.visibility} onChange={(event) => changeVisibility(walk.id, event.target.value)}>
            <option value="private">Private</option><option value="followers">Followers</option>
          </select>
        </label>
        <p className="walk-note">{walk.visibility === 'private' ? 'Hidden from your profile’s follower view.' : 'Visible in your profile’s follower view.'}{walk.sharedChatIds.length > 0 && ` Also shared in ${walk.sharedChatIds.length} chat${walk.sharedChatIds.length === 1 ? '' : 's'}.`}</p>
        {walk.sharedChatIds.length > 0 && <button type="button" className="walk-text-button" onClick={() => revokeShares(walk.id)}>Stop sharing in chats</button>}
        {sharing ? <WalkSharePicker onCancel={() => setSharing(false)} onSend={(chatId) => {
          if (shareWalk(walk.id, chatId)) navigate(`/social/chat/${chatId}`)
        }} /> : <button type="button" className="button button--primary" onClick={() => setSharing(true)}><Send size={18} aria-hidden="true" />Share route in a chat</button>}
        {deleting ? <div className="walk-confirm" role="alert"><p>Delete this walk? Its route will also become unavailable in any chats where you shared it.</p>
          <div className="walk-actions"><button type="button" className="button button--secondary" onClick={() => setDeleting(false)}>Keep walk</button><button type="button" className="button button--primary" onClick={() => { if (deleteWalk(walk.id)) navigate('/profile', { replace: true }) }}>Delete walk</button></div>
        </div> : <button type="button" className="walk-text-button walk-delete" onClick={() => setDeleting(true)}><Trash2 size={16} aria-hidden="true" />Delete walk</button>}
      </> : <p className="walk-note walk-visibility-label">{walk.visibility === 'private' ? <Lock size={14} aria-hidden="true" /> : <Users size={14} aria-hidden="true" />}{walk.visibility === 'private' ? 'Shared in this conversation' : 'Shared with followers'}</p>}
      <Link to={chat ? `/social/chat/${chat.id}` : isOwner || followerView ? '/profile' : `/social/people/${walk.ownerId}`} className="walk-text-button">{chat ? 'Back to chat' : 'Back to walk history'}</Link>
    </div>
  )
}
