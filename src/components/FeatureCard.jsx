import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import './FeatureCard.css'

// The picture + text + arrow tile used on the Home and Profile screens.
export default function FeatureCard({ title, description, icon: Icon, to, tone = 'primary' }) {
  return (
    <Link to={to} className={`feature-card tone-${tone}`}>
      <h2 className="feature-card__title">{title}</h2>
      <span className="feature-card__art" aria-hidden="true">
        <Icon size={38} strokeWidth={1.75} />
      </span>
      <p className="feature-card__description">{description}</p>
      <span className="feature-card__arrow" aria-hidden="true">
        <ArrowRight size={18} strokeWidth={2.5} />
      </span>
    </Link>
  )
}
