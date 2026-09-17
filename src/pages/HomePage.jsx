import { Footprints, TreePine, Dog, MessageCircle } from 'lucide-react'
import FeatureCard from '../components/FeatureCard.jsx'
import { dogProfile } from '../data/mockData.js'
import './HomePage.css'

const HOME_CARDS = [
  {
    title: 'Walk Now',
    description: 'Start a walk and let friends join in.',
    icon: Footprints,
    to: '/coming-soon',
    tone: 'accent',
  },
  {
    title: 'Nearby Parks',
    description: 'Dog-friendly parks close to you.',
    icon: TreePine,
    to: '/map?filter=parks',
    tone: 'primary',
  },
  {
    title: "Who's Around",
    description: 'See dogs out walking nearby.',
    icon: Dog,
    to: '/map?filter=dogs',
    tone: 'water',
  },
  {
    title: 'Groups and Chats',
    description: 'Catch up with your walking crew.',
    icon: MessageCircle,
    to: '/social',
    tone: 'accent',
  },
]

export default function HomePage() {
  return (
    <>
      <section className="home-intro">
        <p className="home-intro__eyebrow">Good to see you!</p>
        <h1 className="home-intro__title">Where to today, {dogProfile.name}?</h1>
      </section>

      <div className="card-grid">
        {HOME_CARDS.map((card) => (
          <FeatureCard key={card.title} {...card} />
        ))}
      </div>
    </>
  )
}
