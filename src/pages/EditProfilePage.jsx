import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { OwnerFields, DogFields, StorageNotice } from '../components/ProfileFields.jsx'
import useProfile from '../hooks/useProfile.js'
import './ProfilePage.css'

export default function EditProfilePage() {
  const { saved, dirty, notice, saveProfile, discard } = useProfile()
  const [error, setError] = useState('')
  const navigate = useNavigate()

  if (!saved.onboardingComplete) return <Navigate to="/onboarding" replace />

  function save(event) {
    event.preventDefault()
    const result = saveProfile()
    if (result.ok) navigate('/profile', { replace: true })
    else setError(result.message)
  }

  return (
    <div className="profile-editor">
      <header className="profile-intro">
        <h1>Edit profile</h1>
        <p>Update your walking preferences and each dog's details.</p>
      </header>
      {notice && <p className="profile-notice" role="alert">{notice}</p>}
      <form className="profile-editor" onSubmit={save} onChange={() => setError('')}>
        <OwnerFields />
        <DogFields />
        <StorageNotice />
        <p className="profile-help" role="status">
          {dirty
            ? 'Unsaved changes. Your draft stays available when you switch pages. Save before closing this app.'
            : 'No unsaved changes.'}
        </p>
        {error && <p role="alert" className="profile-error">{error}</p>}
        <div className="profile-actions">
          <button className="button button--primary" type="submit">Save profile</button>
          <button className="button button--secondary" type="button" disabled={!dirty} onClick={() => { discard(); setError('') }}>
            Discard changes
          </button>
        </div>
      </form>
    </div>
  )
}
