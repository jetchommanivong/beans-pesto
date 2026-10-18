import { useState } from 'react'
import DogTags from './DogTags.jsx'
import ProfilePhotoInput from './ProfilePhotoInput.jsx'
import useProfile from '../hooks/useProfile.js'
import { createDog, TEMPERAMENT_TAGS, TAG_LABELS } from '../data/profileData.js'

export function OwnerFields() {
  const { draft, setDraft } = useProfile()
  const update = (key, value) => setDraft(current => ({ ...current, owner: { ...current.owner, [key]: value } }))
  return <section className="profile-panel" aria-labelledby="owner-heading">
    <h2 id="owner-heading">About you</h2>
    <ProfilePhotoInput label="Your photo (optional)" name={draft.owner.name} photo={draft.owner.photo} size={112} onChange={value => update('photo', value)} />
    <label>Display name (required)<input autoComplete="nickname" required maxLength={60} value={draft.owner.name} onChange={e => update('name', e.target.value)} /></label>
    <label>Age (optional)<input type="number" inputMode="numeric" min={0} max={120} step={1} value={draft.owner.age} onChange={e => update('age', e.target.value)} /></label>
    <div className="profile-field-row">
      <label>Gender (optional)<input maxLength={40} value={draft.owner.gender} onChange={e => update('gender', e.target.value)} /></label>
      <label>Pronouns (optional)<input maxLength={40} placeholder="e.g. she/her" value={draft.owner.pronouns} onChange={e => update('pronouns', e.target.value)} /></label>
    </div>
    <label>Suburb (optional)<input maxLength={80} placeholder="e.g. Toowong" value={draft.owner.suburb} onChange={e => update('suburb', e.target.value)} /></label>
    <p className="profile-help">A suburb is enough. Please leave out your street address.</p>
    <label>Walking preferences (optional)<input maxLength={160} placeholder="e.g. Quiet morning walks, 30 minutes" value={draft.owner.preferences} onChange={e => update('preferences', e.target.value)} /></label>
    <label>Favourite park (optional)<input maxLength={100} placeholder="Enter a park name" value={draft.owner.favouritePark} onChange={e => update('favouritePark', e.target.value)} /></label>
  </section>
}

export function DogFields() {
  const { draft, setDraft } = useProfile()
  const [removed, setRemoved] = useState(null)
  function update(id, field, value) {
    setDraft(current => ({ ...current, dogs: current.dogs.map(dog => dog.id === id ? { ...dog, [field]: value } : dog) }))
  }
  function remove(dog, index) {
    setRemoved({ dog, index })
    setDraft(current => ({ ...current, dogs: current.dogs.filter(item => item.id !== dog.id) }))
  }
  function undo() {
    setDraft(current => {
      if (current.dogs.some(dog => dog.id === removed.dog.id)) return current
      const dogs = [...current.dogs]; dogs.splice(removed.index, 0, removed.dog)
      return { ...current, dogs }
    })
    setRemoved(null)
  }
  return <section className="profile-dogs" aria-labelledby="dogs-heading">
    <h2 id="dogs-heading">Your dogs ({draft.dogs.length})</h2>
    {draft.dogs.map((dog, index) => <section className="profile-panel" key={dog.id} aria-labelledby={`dog-${dog.id}`}>
      <h3 id={`dog-${dog.id}`}>{dog.name.trim() || `Dog ${index + 1}`}</h3>
      <ProfilePhotoInput label={`${dog.name.trim() || `Dog ${index + 1}`} photo (optional)`} name={dog.name} photo={dog.photo} tone="accent" onChange={value => update(dog.id, 'photo', value)} />
      <label>Dog's name (required)<input required maxLength={60} value={dog.name} onChange={e => update(dog.id, 'name', e.target.value)} /></label>
      <label>Breed or mix (optional)<input maxLength={80} value={dog.breed} onChange={e => update(dog.id, 'breed', e.target.value)} /></label>
      <div className="profile-field-row">
        <label>Dog age (optional)<input type="number" inputMode="numeric" min={0} max={dog.ageUnit === 'months' ? 360 : 30} step={1} value={dog.age} onChange={e => update(dog.id, 'age', e.target.value)} /></label>
        <label>Age unit<select value={dog.ageUnit} onChange={e => update(dog.id, 'ageUnit', e.target.value)}><option value="years">Years</option><option value="months">Months</option></select></label>
      </div>
      <label>Sex (optional)<select value={dog.sex} onChange={e => update(dog.id, 'sex', e.target.value)}><option value="">Not provided</option><option value="female">Female</option><option value="male">Male</option></select></label>
      <label>Dog size (optional)<select value={dog.size} onChange={e => update(dog.id, 'size', e.target.value)}><option value="">Not provided</option><option value="small">Small dog</option><option value="medium">Medium dog</option><option value="large">Large dog</option></select></label>
      <DogTags size={dog.size} tags={dog.temperamentTags.map(id => TAG_LABELS[id]).filter(Boolean)} />
      <fieldset><legend>Temperament (optional)</legend>
        <p className="profile-help">Select all that apply to this dog. You can change these later.</p>
        <div className="profile-tags">{TEMPERAMENT_TAGS.map(tag => <label className={`profile-tag ${dog.temperamentTags.includes(tag.id) ? 'profile-tag--selected' : ''}`} key={tag.id}>
          <input type="checkbox" checked={dog.temperamentTags.includes(tag.id)} onChange={e => update(dog.id, 'temperamentTags', e.target.checked ? [...dog.temperamentTags, tag.id] : dog.temperamentTags.filter(id => id !== tag.id))} />{tag.label}
        </label>)}</div>
        {!dog.temperamentTags.length && <p className="profile-help">Temperament not provided.</p>}
      </fieldset>
      <p className="profile-help">These descriptions are provided by the owner. They do not guarantee that dogs will get along.</p>
      {draft.dogs.length > 1 && <button type="button" className="button button--secondary button--small" onClick={() => remove(dog, index)}>Remove {dog.name.trim() || `dog ${index + 1}`}</button>}
    </section>)}
    {removed && <div className="profile-notice"><span role="status">Removed {removed.dog.name || 'dog'}.</span> <button type="button" className="button button--secondary button--small" onClick={undo}>Undo last removal</button></div>}
    <button type="button" className="button button--secondary" onClick={() => setDraft(current => ({ ...current, dogs: [...current.dogs, createDog()] }))}>Add another dog</button>
  </section>
}

export function StorageNotice() {
  return <aside className="profile-notice"><strong>Your profile stays on this browser</strong><p>It is not uploaded or shown to other people. Clearing site data may remove it. Profile setup does not request your location or enable sharing.</p></aside>
}
