import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import Avatar from './Avatar.jsx'
import './ListItem.css'

// A tappable row with an avatar, used for groups and chats.
export default function ListItem({ title, subtitle, meta, tone, to = '/coming-soon' }) {
  return (
    <li>
      <Link to={to} className="list-item">
        <Avatar name={title} tone={tone} />
        <span className="list-item__text">
          <span className="list-item__title">{title}</span>
          <span className="list-item__subtitle">{subtitle}</span>
        </span>
        {meta && <span className="list-item__meta">{meta}</span>}
        <ChevronRight className="list-item__chevron" size={20} aria-hidden="true" />
      </Link>
    </li>
  )
}
