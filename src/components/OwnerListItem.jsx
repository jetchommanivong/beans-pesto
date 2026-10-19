import { Link } from 'react-router'
import { Send } from 'lucide-react'
import ListItem from './ListItem.jsx'

export default function OwnerListItem({ person, action }) {
  return (
    <ListItem
      title={person.name}
      subtitle={`${person.dog} · ${person.suburb}`}
      tone={person.tone}
      to={`/social/people/${person.id}`}
      action={
        <>
          {action}
          <Link
            to={`/social/chat/chat-${person.id}`}
            className="button button--secondary owner-message"
            aria-label={`Message ${person.name}`}
            title={`Message ${person.name}`}
          >
            <Send size={18} aria-hidden="true" />
          </Link>
        </>
      }
    />
  )
}
