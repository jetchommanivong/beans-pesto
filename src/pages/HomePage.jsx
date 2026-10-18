import { Link } from 'react-router'
import { ChevronRight, Droplet, Footprints, MapPin, PawPrint } from 'lucide-react'
import Avatar from '../components/Avatar.jsx'
import HomePrivacyStatus from '../components/HomePrivacyStatus.jsx'
import useNearbyPlaces from '../hooks/useNearbyPlaces.js'
import usePrivacySettings from '../hooks/usePrivacySettings.js'
import useProfile from '../hooks/useProfile.js'
import useUserLocation from '../hooks/useUserLocation.js'
import { formatDistance } from '../data/brisbaneOpenData.js'
import { nearbyDogs } from '../data/mockData.js'
import './HomePage.css'

const SEARCH_RADIUS_KM = 3

// Home answers "what should I do right now?". Getting to the Map, Social and
// Profile screens is the bottom navigation's job, so nothing here repeats it.
export default function HomePage() {
  const { saved } = useProfile()
  const { location, isPrecise, status, requestLocation } = useUserLocation()
  const { settings } = usePrivacySettings()
  const { places, status: dataStatus } = useNearbyPlaces({
    lat: location.lat,
    lon: location.lon,
    radiusKm: SEARCH_RADIUS_KM,
  })

  // `places` is already sorted by distance, so the first of each type is the closest.
  const nearestPark = places.find((place) => place.type === 'dogParks')
  const nearestWater = places.find((place) => place.type === 'water')

  // A saved profile always holds a dog, but it may not be named yet.
  const myDogName = saved.dogs.find((dog) => dog.name.trim())?.name.trim() ?? ''

  return (
    <div className="home">
      <section className="home-intro">
        <p className="home-intro__eyebrow">Good to see you!</p>
        <h1 className="home-intro__title">
          {saved.owner.name ? `Ready for a walk, ${saved.owner.name}?` : 'Ready for a walk?'}
        </h1>
      </section>

      <HomePrivacyStatus settings={settings} />

      {/* Opens the dog-park map until the walk screen (task 16) exists. */}
      <Link to="/map?filter=dogParks" className="button button--primary home-cta">
        <Footprints size={20} aria-hidden="true" />
        Start a walk
      </Link>

      {!isPrecise && (
        <p className="home-location">
          Showing places near central Brisbane.{' '}
          <button type="button" className="home-location__button" onClick={requestLocation}>
            {status === 'locating' ? 'Finding you…' : 'Use my location'}
          </button>
        </p>
      )}

      <section className="home-section">
        <h2 className="home-section__title">Closest off-leash park</h2>
        {dataStatus === 'loading' && <p className="home-placeholder">Looking for parks nearby…</p>}
        {dataStatus === 'error' && (
          <p className="home-placeholder">Couldn&apos;t reach the council&apos;s park data.</p>
        )}
        {dataStatus === 'ready' &&
          (nearestPark ? (
            <Link
              to={`/map?filter=dogParks&place=${nearestPark.id}`}
              className="home-place tone-accent"
            >
              <span className="home-place__icon" aria-hidden="true">
                <PawPrint size={24} />
              </span>
              <span className="home-place__text">
                <span className="home-place__name">{nearestPark.name}</span>
                <span className="home-place__detail">
                  {formatDistance(nearestPark.distanceKm)} · {nearestPark.detail}
                </span>
              </span>
              <ChevronRight className="home-place__chevron" size={20} aria-hidden="true" />
            </Link>
          ) : (
            <p className="home-placeholder">No off-leash areas within {SEARCH_RADIUS_KM} km.</p>
          ))}
      </section>

      {nearestWater && (
        <Link to={`/map?filter=water&place=${nearestWater.id}`} className="home-water tone-water">
          <Droplet size={18} aria-hidden="true" />
          <span>
            Nearest water stop: <strong>{nearestWater.name}</strong>,{' '}
            {formatDistance(nearestWater.distanceKm)} away
          </span>
        </Link>
      )}

      <section className="home-section">
        <h2 className="home-section__title">Out walking now</h2>
        <ul className="home-dogs">
          {settings.shareLocation && (
            <li>
              <Link to="/profile/privacy" className="home-dog">
                <Avatar name={myDogName || saved.owner.name || 'You'} tone="primary" size={44} />
                <span className="home-dog__text">
                  <span className="home-dog__name">
                    {myDogName ? `You and ${myDogName}` : 'You'}
                  </span>
                  <span className="home-dog__detail">Visible to friends while you walk</span>
                </span>
                <MapPin className="home-dog__pin" size={18} aria-hidden="true" />
              </Link>
            </li>
          )}
          {nearbyDogs.map((dog) => (
            <li key={dog.id}>
              <Link to="/social" className="home-dog">
                <Avatar name={dog.name} tone="accent" size={44} />
                <span className="home-dog__text">
                  <span className="home-dog__name">{dog.name}</span>
                  <span className="home-dog__detail">{dog.detail}</span>
                </span>
                <MapPin className="home-dog__pin" size={18} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
