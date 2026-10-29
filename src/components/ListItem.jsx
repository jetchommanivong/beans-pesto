import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import Avatar from './Avatar.jsx'
import './ListItem.css'

// Keep trailing actions beside the link so buttons and links never nest.
export default function ListItem({ title, titleDetail, subtitle, meta, tone, to, action, avatar }) {
  const content = (
    <>
      {avatar ?? <Avatar name={title} tone={tone} />}
      <span className="list-item__text">
        <span className="list-item__title-row">
          <span className="list-item__title">{title}</span>
          {titleDetail && <span className="list-item__title-detail">{titleDetail}</span>}
          {meta && <span className="list-item__meta">{meta}</span>}
        </span>
        <span className="list-item__subtitle">{subtitle}</span>
      </span>
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
