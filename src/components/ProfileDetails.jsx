import { Footprints, MapPin, Trees } from 'lucide-react'
import Avatar from './Avatar.jsx'
import DogTags from './DogTags.jsx'
import { formatAge, TAG_LABELS } from '../data/profileData.js'
import '../pages/ProfilePage.css'
import '../pages/ProfileOverview.css'

// The saved profile and guided setup preview share the same cards and styling.
export default function ProfileDetails({ profile }) {
  const { owner } = profile
  const dogs = profile.dogs.filter(dog => dog.name.trim())

  return (
    <div className="profile-overview">
      <section className="profile-panel profile-owner" aria-labelledby="profile-owner-name">
        <div className="profile-overview__identity">
          <Avatar name={owner.name} photo={owner.photo} size={112} />
          <div className="profile-overview__identity-text">
            <h2 id="profile-owner-name">{owner.name}</h2>
            {(owner.age !== '' || owner.gender || owner.pronouns) && <p className="profile-owner__meta">{[formatAge(owner.age), owner.gender, owner.pronouns].filter(Boolean).join(' · ')}</p>}
            {owner.suburb && (
              <p className="profile-owner__suburb">
                <MapPin size={15} aria-hidden="true" />{owner.suburb}
              </p>
            )}
          </div>
        </div>

        {(owner.preferences || owner.favouritePark) && (
          <dl className="profile-owner__details">
            {owner.preferences && (
              <div>
                <dt><Footprints size={17} aria-hidden="true" />Walking preferences</dt>
                <dd>{owner.preferences}</dd>
              </div>
            )}
            {owner.favouritePark && (
              <div>
                <dt><Trees size={17} aria-hidden="true" />Favourite park</dt>
                <dd>{owner.favouritePark}</dd>
              </div>
            )}
          </dl>
        )}
      </section>

      <section className="profile-overview__dogs" aria-labelledby="profile-dogs-title">
        <h2 id="profile-dogs-title" className="profile-overview__section-title">Your dogs ({dogs.length})</h2>
        {dogs.length ? (
          <ul className="profile-overview__dog-list">
            {dogs.map(dog => (
              <li key={dog.id}>
                <article className="profile-panel profile-dog" aria-labelledby={`profile-dog-${dog.id}`}>
                  <div className="profile-overview__identity">
                    <Avatar name={dog.name} photo={dog.photo} tone="accent" size={96} />
                    <div className="profile-overview__identity-text">
                      <h3 id={`profile-dog-${dog.id}`}>{dog.name}</h3>
                      {dog.breed && <p className="profile-dog__breed">{dog.breed}</p>}
                      {(dog.age !== '' || dog.sex) && <p className="profile-dog__meta">{[formatAge(dog.age, dog.ageUnit), dog.sex === 'female' ? 'Female' : dog.sex === 'male' ? 'Male' : ''].filter(Boolean).join(' · ')}</p>}
                    </div>
                  </div>
                  {(dog.size || dog.temperamentTags.length > 0) && (
                    <DogTags size={dog.size} tags={dog.temperamentTags.map(id => TAG_LABELS[id]).filter(Boolean)} />
                  )}
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="profile-panel profile-overview__empty">
            <p>No dogs added yet. Add their details in Edit profile.</p>
          </div>
        )}
      </section>
    </div>
  )
}
