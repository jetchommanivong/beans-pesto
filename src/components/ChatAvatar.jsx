import Avatar from './Avatar.jsx'
import { owners } from '../data/mockData.js'
import './ChatAvatar.css'

export default function ChatAvatar({ chat }) {
  if (!chat.isGroup) return <Avatar name={chat.name} tone="water" />
  const members = chat.memberIds.slice(0, 2).map((id) => owners.find((person) => person.id === id))
  return (
    <span className="chat-avatar" role="img" aria-label="Group chat">
      {members.map((person) => <Avatar key={person.id} name={person.name} tone={person.tone} size={34} />)}
    </span>
  )
}
