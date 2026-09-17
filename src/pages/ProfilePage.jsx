import { Dog, Footprints, ShieldCheck, Smile, TreePine } from 'lucide-react'
import FeatureCard from '../components/FeatureCard.jsx'
import { dogProfile } from '../data/mockData.js'
import './ProfilePage.css'

export default function ProfilePage() {
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
    {
      title: 'Privacy',
      description: dogProfile.privacy,
      icon: ShieldCheck,
      tone: 'primary',
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
        </div>
      </section>

      <div className="card-grid">
        {profileCards.map((card) => (
          <FeatureCard key={card.title} to="/coming-soon" {...card} />
        ))}
      </div>
    </>
  )
}
