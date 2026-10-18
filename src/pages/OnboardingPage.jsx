import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { OwnerFields, DogFields, StorageNotice } from '../components/ProfileFields.jsx'
import useProfile from '../hooks/useProfile.js'
import { profileError, TAG_LABELS } from '../data/profileData.js'
import './ProfilePage.css'
const STEPS = ['About you', 'Your dogs', 'Review and finish']

export default function OnboardingPage() {
  const { draft, notice, saveProfile } = useProfile()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const heading = useRef(null)
  const navigate = useNavigate()
  useEffect(() => { heading.current?.focus() }, [step])
  function next(event) {
    event.preventDefault()
    const problem = profileError(draft, step === 0 ? 'owner' : step === 1 ? 'dogs' : 'all')
    if (problem) { setError(problem); return }
    if (step < 2) { setError(''); setStep(step + 1); return }
    const result = saveProfile(true)
    if (result.ok) navigate('/profile')
    else setError(result.message)
  }
  return <div className="profile-editor">
    <header className="profile-intro"><p className="profile-eyebrow">WELCOME TO TAILMATES</p><h1 ref={heading} tabIndex={-1}>{STEPS[step]}</h1><p>Find park information and set up a profile for you and your dogs. You can browse the map without completing setup.</p></header>
    <ol className="setup-steps" aria-label="Setup progress">{STEPS.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined}>{index + 1}. {label}</li>)}</ol>
    {notice && <p className="profile-notice" role="alert">{notice}</p>}
    <form className="profile-editor" onSubmit={next} onChange={() => setError('')}>
      {step === 0 && <OwnerFields />}
      {step === 1 && <DogFields />}
      {step === 2 && <section className="profile-panel"><h2>Check your details</h2><p><strong>{draft.owner.name}</strong>{draft.owner.suburb ? ` · ${draft.owner.suburb}` : ''}</p><p>Walking preferences: {draft.owner.preferences || 'Not provided'}</p><p>Favourite park: {draft.owner.favouritePark || 'Not provided'}</p>{draft.dogs.map(dog => <div key={dog.id}><h3>{dog.name}</h3><p>{dog.breed || 'Breed not provided'}</p><p>{dog.temperamentTags.map(id => TAG_LABELS[id]).join(' · ') || 'Temperament not provided'}</p></div>)}<p className="profile-help">Setup does not turn on location or publish your profile. You can edit these details later.</p></section>}
      <StorageNotice />
      {error && <p role="alert" className="profile-error">{error}</p>}
      <div className="profile-actions">{step > 0 && <button type="button" className="button button--secondary" onClick={() => { setStep(step - 1); setError('') }}>Back</button>}<button type="submit" className="button button--primary">{step === 2 ? 'Save and finish setup' : 'Continue'}</button></div>
    </form>
    <Link to="/map">Browse the map for now</Link><p className="profile-help">Your unsaved draft stays available while this app remains open.</p>
  </div>
}