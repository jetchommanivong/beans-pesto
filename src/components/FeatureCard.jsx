import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import './FeatureCard.css'

// The picture + text + arrow tile used on the Home and Profile screens.
// Without a `to`, it is a plain information tile: no arrow, nothing to tap.
export default function FeatureCard({ title, description, icon: Icon, to, tone = 'primary' }) {
  const content = (
    <>
      <h2 className="feature-card__title">{title}</h2>
      <span className="feature-card__art" aria-hidden="true">
        <Icon size={38} strokeWidth={1.75} />
      </span>
      <p className="feature-card__description">{description}</p>
      {to && (
        <span className="feature-card__arrow" aria-hidden="true">
          <ArrowRight size={18} strokeWidth={2.5} />
        </span>
      )}
    </>
  )

  if (!to) return <div className={`feature-card tone-${tone}`}>{content}</div>

  return (
    <Link to={to} className={`feature-card tone-${tone}`}>
      {content}
    </Link>
  )
}
