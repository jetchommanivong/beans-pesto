import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import Avatar from './Avatar.jsx'
import './ListItem.css'

// A row with an avatar, used for groups and chats. Give it a `to` to make it
// tappable; without one it is shown as information only, so it never leads to a dead end.
export default function ListItem({ title, subtitle, meta, tone, to }) {
  const content = (
    <>
      <Avatar name={title} tone={tone} />
      <span className="list-item__text">
        <span className="list-item__title">{title}</span>
        <span className="list-item__subtitle">{subtitle}</span>
      </span>
      {meta && <span className="list-item__meta">{meta}</span>}
      {to && <ChevronRight className="list-item__chevron" size={20} aria-hidden="true" />}
    </>
  )

  return (
    <li>
      {to ? (
        <Link to={to} className="list-item">
          {content}
        </Link>
      ) : (
        <div className="list-item">{content}</div>
      )}
    </li>
  )
}
