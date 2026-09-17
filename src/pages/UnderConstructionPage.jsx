import { Link } from 'react-router'
import { Construction, House, Sparkles } from 'lucide-react'
import './UnderConstructionPage.css'

export default function UnderConstructionPage() {
  return (
    <div className="construction">
      <h1 className="construction__title">
        <Sparkles size={20} aria-hidden="true" />
        Under Construction
        <Sparkles size={20} aria-hidden="true" />
      </h1>

      <div className="construction__art" aria-hidden="true">
        <Construction size={80} strokeWidth={1.5} />
      </div>

      <div>
        <p className="construction__message">This page is still being built.</p>
        <p className="construction__hint">We&apos;re fetching it as fast as we can!</p>
      </div>

      <Link to="/" className="button button--primary">
        <House size={18} aria-hidden="true" />
        Back to Home
      </Link>
    </div>
  )
}
