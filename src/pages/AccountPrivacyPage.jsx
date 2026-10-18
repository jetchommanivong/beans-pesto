import { MapPin, UserSearch } from 'lucide-react'
import usePrivacySettings from '../hooks/usePrivacySettings.js'
import './AccountPrivacyPage.css'

// Privacy lives on the account, so it applies to every dog the owner adds.
export default function AccountPrivacyPage() {
  const { settings, setSetting } = usePrivacySettings()

  return (
    <div className="privacy">
      <h1 className="privacy__title">Privacy</h1>
      <p className="privacy__intro">
        These settings belong to you, not to one dog. Everything is off until you turn it on.
      </p>

      <ul className="privacy__list">
        <PrivacyToggle
          icon={MapPin}
          title="Share my location on walks"
          description="Friends can see where you are while a walk is running. Stop it any time."
          checked={settings.shareLocation}
          onChange={(value) => setSetting('shareLocation', value)}
        />
        <PrivacyToggle
          icon={UserSearch}
          title="Suggest me to others"
          description="Show you and your dogs in other owners' suggested walkers, matched by suburb and walking preferences."
          checked={settings.suggestToOthers}
          onChange={(value) => setSetting('suggestToOthers', value)}
        />
      </ul>
    </div>
  )
}

function PrivacyToggle({ icon: Icon, title, description, checked, onChange }) {
  return (
    <li className="privacy-row">
      <span className="privacy-row__icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <span className="privacy-row__text">
        <span className="privacy-row__title">{title}</span>
        <span className="privacy-row__description">{description}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className="privacy-switch"
        onClick={() => onChange(!checked)}
      >
        <span className="privacy-switch__state">{checked ? 'On' : 'Off'}</span>
      </button>
    </li>
  )
}
