import { Link } from 'react-router'
import { ChevronRight, Dog, Footprints, ShieldCheck, Smile, TreePine } from 'lucide-react'
import DogTags from '../components/DogTags.jsx'
import FeatureCard from '../components/FeatureCard.jsx'
import usePrivacySettings from '../hooks/usePrivacySettings.js'
import { dogDetails } from '../data/dogDetails.js'
import { dogProfile } from '../data/mockData.js'
import '../components/ListItem.css'
import './ProfilePage.css'
import './ProfileAccount.css'

export default function ProfilePage() {
  const { settings } = usePrivacySettings()

  // Dog details only. Privacy is an account setting, so it is no longer a dog card.
  const profileCards = [
    {
      title: 'Temperament',
      description: dogProfile.temperament,
      icon: Smile,
      tone: 'accent',
    },
    {
      title: 'Favourite Park',
      description: dogProfile.favouritePark,
      icon: TreePine,
      tone: 'primary',
    },
    {
      title: 'Walk Preferences',
      description: dogProfile.walkPreferences,
      icon: Footprints,
      tone: 'water',
    },
  ]

  return (
    <>
      <section className="profile-hero">
        <div className="profile-hero__photo" aria-hidden="true">
          <Dog size={56} strokeWidth={1.5} />
        </div>
        <div className="profile-hero__info">
          <h1 className="profile-hero__name">{dogProfile.name}</h1>
          <dl className="profile-hero__facts">
            <div>
              <dt>Breed</dt>
              <dd>{dogProfile.breed}</dd>
            </div>
            <div>
              <dt>Temperament</dt>
              <dd>{dogProfile.temperament}</dd>
            </div>
          </dl>
          <DogTags size={dogDetails.size} tags={dogDetails.temperamentTags} />
        </div>
      </section>

      <div className="card-grid">
        {profileCards.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </div>

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
    </>
  )
}
