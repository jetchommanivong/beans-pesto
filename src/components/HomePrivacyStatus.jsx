import { Link } from 'react-router'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import './HomePrivacyStatus.css'

// Shows on Home only while the owner has switched something on in Privacy, so the
// choice is visible straight away and one tap leads back to change it.
export default function HomePrivacyStatus({ settings }) {
  const messages = []
  if (settings.suggestToOthers) messages.push("You're suggested to nearby owners")
  if (messages.length === 0) return null

  return (
    <Link to="/profile/privacy" className="home-privacy-status">
      <ShieldCheck size={20} aria-hidden="true" />
      <span className="home-privacy-status__text">
        {messages.map((message) => (
          <span key={message}>{message}</span>
        ))}
        <span className="home-privacy-status__manage">Change in Privacy</span>
      </span>
      <ChevronRight size={18} aria-hidden="true" />
    </Link>
  )
}
