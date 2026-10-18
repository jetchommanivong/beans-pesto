import { Link } from 'react-router'
import { Pencil, ShieldCheck } from 'lucide-react'
import ProfileDetails from '../components/ProfileDetails.jsx'
import useProfile from '../hooks/useProfile.js'
import './ProfilePage.css'
import './ProfileOverview.css'

export default function ProfilePage() {
  const { saved, dirty, notice } = useProfile()

  return (
    <div className="profile-overview">
      <header className="profile-overview__heading">
        <h1>Your profile</h1>
        <div className="profile-overview__actions">
          {saved.onboardingComplete && <Link to="/profile/edit" className="button button--secondary profile-overview__edit">
            <Pencil size={16} aria-hidden="true" />
            Edit profile
          </Link>}
          <Link to="/profile/privacy" className="button profile-overview__edit profile-overview__privacy">
            <ShieldCheck size={17} aria-hidden="true" />
            Privacy
          </Link>
        </div>
      </header>

      {notice && <p className="profile-notice" role="alert">{notice}</p>}
      {dirty && saved.onboardingComplete && (
        <p className="profile-notice">
          You have unsaved changes. <Link to="/profile/edit">Continue editing</Link>
        </p>
      )}

      {!saved.onboardingComplete ? (
        <section className="profile-panel profile-overview__setup" aria-labelledby="profile-setup-title">
          <h2 id="profile-setup-title">Create your profile</h2>
          <p>Tell us a little about yourself and add your dogs in a few simple steps.</p>
          <Link to="/onboarding" className="button button--primary">{dirty ? 'Continue setup' : 'Create profile'}</Link>
        </section>
      ) : <ProfileDetails profile={saved} />}

      <p className="profile-help">Your details and photos stay on this browser and aren't shown to other people.</p>
    </div>
  )
}
