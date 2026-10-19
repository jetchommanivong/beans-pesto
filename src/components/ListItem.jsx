import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import Avatar from './Avatar.jsx'
import './ListItem.css'

// Keep trailing actions beside the link so buttons and links never nest.
export default function ListItem({ title, subtitle, meta, tone, to, action, avatar }) {
  const content = (
    <>
      {avatar ?? <Avatar name={title} tone={tone} />}
      <span className="list-item__text">
        <span className="list-item__title">{title}</span>
        <span className="list-item__subtitle">{subtitle}</span>
      </span>
      {meta && <span className="list-item__meta">{meta}</span>}
      {to && !action && <ChevronRight className="list-item__chevron" size={20} aria-hidden="true" />}
    </>
  )

  return (
    <li className="list-item">
      {to ? (
        <Link to={to} className="list-item__main">
          {content}
        </Link>
      ) : (
        <div className="list-item__main">{content}</div>
      )}
      {action && <div className="list-item__actions">{action}</div>}
    </li>
  )
}
