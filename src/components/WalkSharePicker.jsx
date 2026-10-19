import { useState } from 'react'
import { Send } from 'lucide-react'
import ChatAvatar from './ChatAvatar.jsx'
import useWalks from '../hooks/useWalks.js'
import { allChats } from '../data/mockData.js'
import { formatWalkDistance, walkDistance } from '../data/walkData.js'
import './Walks.css'

export function WalkRoutePicker({ onSend, onCancel }) {
  const { walks, notice } = useWalks()
  const routes = walks.filter((walk) => walk.ownerId === 'me').sort((a, b) => b.startedAt - a.startedAt)
  return (
    <section className="composer walk-share-picker" aria-label="Share a walk route">
      <h2>Share a walk</h2>
      <p className="walk-note">Members of this chat will be able to open the full route, including its start and finish. A private walk stays private on your profile.</p>
      {notice && <p className="walk-notice" role="alert">{notice}</p>}
      {routes.length ? <ul className="list">{routes.map((walk) => <li key={walk.id}>
        <button type="button" className="walk-share-target" onClick={() => onSend(walk.id)} aria-label={`Send ${walk.title}`}>
          <span className="walk-card__text"><strong>{walk.title}</strong><span>{formatWalkDistance(walkDistance(walk.points))} · {walk.visibility === 'private' ? 'Private' : 'Followers'}</span></span><Send size={18} aria-hidden="true" />
        </button>
      </li>)}</ul> : <p className="walk-empty">Save a walk first to share its route here.</p>}
      <button type="button" className="button button--secondary button--small" onClick={onCancel}>Cancel</button>
    </section>
  )
}

export default function WalkSharePicker({ onSend, onCancel }) {
  const [query, setQuery] = useState('')
  const conversations = allChats.filter((chat) => chat.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  return (
    <section className="profile-panel walk-share-picker" aria-label="Choose a chat">
      <h2>Send to a chat</h2>
      <p className="walk-note">The people in your chosen chat will be able to see the full route, including your start and finish.</p>
      <label htmlFor="walk-chat-search" className="visually-hidden">Find a chat</label>
      <input id="walk-chat-search" className="walk-search" type="search" placeholder="Find a person or group" value={query} onChange={(event) => setQuery(event.target.value)} />
      <ul className="list">{conversations.map((chat) => <li key={chat.id}>
        <button type="button" className="walk-share-target" onClick={() => onSend(chat.id)} aria-label={`Send walk to ${chat.name}`}>
          <ChatAvatar chat={chat} /><span className="walk-card__text"><strong>{chat.name}</strong><span>{chat.isGroup ? 'Group chat' : 'Direct message'}</span></span><Send size={18} aria-hidden="true" />
        </button>
      </li>)}</ul>
      {!conversations.length && <p className="walk-empty">No chats match your search.</p>}
      <button type="button" className="button button--secondary" onClick={onCancel}>Cancel</button>
    </section>
  )
}
