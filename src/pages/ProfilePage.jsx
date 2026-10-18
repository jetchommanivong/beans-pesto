import { useState } from 'react'
import { Link } from 'react-router'
import useProfile from '../hooks/useProfile.js'
import { ChevronRight, ShieldCheck } from 'lucide-react'
import usePrivacySettings from '../hooks/usePrivacySettings.js'
import '../components/ListItem.css'
import './ProfileAccount.css'
import { OwnerFields, DogFields, StorageNotice } from '../components/ProfileFields.jsx'
import './ProfilePage.css'

export default function ProfilePage() {
  const { dirty, notice, saveProfile, discard } = useProfile()
  const { settings } = usePrivacySettings()
  const [result, setResult] = useState(null)
  function save(event) { event.preventDefault(); setResult(saveProfile()) }
  return <div className="profile-editor">
    <header className="profile-intro"><p className="profile-eyebrow">YOUR WALKING COMPANIONS</p><h1>Your profile</h1><p>Keep your walking preferences and each dog's details together.</p><Link to="/onboarding">Open guided setup</Link></header>
    {notice && <p className="profile-notice" role="alert">{notice}</p>}
    <form className="profile-editor" onSubmit={save} onChange={() => setResult(null)}>
      <OwnerFields /><DogFields /><StorageNotice />
      <p className="profile-help" role="status">{dirty ? 'Unsaved changes. Your draft stays available when you switch pages. Save before closing this app.' : 'No unsaved changes.'}</p>
      {result && (!result.ok || !dirty) && <p role={result.ok ? 'status' : 'alert'} className={result.ok ? 'profile-success' : 'profile-error'}>{result.message}</p>}
      <div className="profile-actions"><button className="button button--primary" type="submit">Save profile</button><button className="button button--secondary" type="button" disabled={!dirty} onClick={() => { discard(); setResult(null) }}>Discard changes</button></div>
    </form>
      <h2 className="profile-account-title">Your account</h2>
      <Link to="/profile/privacy" className="list-item tone-primary profile-privacy">
        <ShieldCheck size={24} aria-hidden="true" />
        <span className="list-item__text">
          <span className="list-item__title">Privacy</span>
          <span className="list-item__subtitle">
            Location sharing {settings.shareLocation ? 'on' : 'off'} · Suggested to others{' '}
            {settings.suggestToOthers ? 'on' : 'off'}
          </span>
        </span>
        <ChevronRight className="list-item__chevron" size={20} aria-hidden="true" />
      </Link>
  </div>
}