import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRight, Droplet, PawPrint, Search, TreePine } from 'lucide-react'
import PlacesMap from '../components/PlacesMap.jsx'
import useNearbyPlaces from '../hooks/useNearbyPlaces.js'
import useUserLocation from '../hooks/useUserLocation.js'
import { distanceInKm, formatDistance } from '../data/brisbaneOpenData.js'
import { nearbyDogs } from '../data/mockData.js'
import './MapPage.css'

const SEARCH_RADIUS_KM = 3

const FILTERS = [
  { id: 'parks', label: 'Parks', icon: TreePine, tone: 'primary' },
  { id: 'water', label: 'Water', icon: Droplet, tone: 'water' },
  { id: 'dogs', label: 'Dogs', icon: PawPrint, tone: 'accent' },
]
const FILTER_IDS = FILTERS.map((filter) => filter.id)

function getFilter(type) {
  return FILTERS.find((filter) => filter.id === type)
}

export default function MapPage() {
  const [searchParams] = useSearchParams()
  const startingFilter = searchParams.get('filter')

  // The key resets the map's filters when the link changes, e.g. from "/map?filter=dogs" to "/map".
  return <MapScreen key={startingFilter ?? 'all'} startingFilter={startingFilter} />
}

function MapScreen({ startingFilter }) {
  const { location, status: locationStatus } = useUserLocation()
  const {
    places: councilPlaces,
    status: dataStatus,
    retry,
  } = useNearbyPlaces({ lat: location.lat, lon: location.lon, radiusKm: SEARCH_RADIUS_KM })

  const [activeFilters, setActiveFilters] = useState(() =>
    FILTER_IDS.includes(startingFilter) ? [startingFilter] : FILTER_IDS,
  )
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  // Dogs out walking are still placeholder data, positioned around the user.
  const dogsNearby = useMemo(
    () =>
      nearbyDogs.map((dog) => {
        const position = { lat: location.lat + dog.latOffset, lon: location.lon + dog.lonOffset }
        return {
          ...dog,
          ...position,
          type: 'dogs',
          shape: null,
          distanceKm: distanceInKm(location, position),
        }
      }),
    [location],
  )

  const allPlaces = [...councilPlaces, ...dogsNearby]
  const searchText = query.trim().toLowerCase()
  const visiblePlaces = allPlaces.filter(
    (place) =>
      activeFilters.includes(place.type) && place.name.toLowerCase().includes(searchText),
  )
  const selectedPlace =
    visiblePlaces.find((place) => place.id === selectedId) ?? visiblePlaces[0] ?? null

  function toggleFilter(id) {
    setActiveFilters((current) =>
      current.includes(id) ? current.filter((filterId) => filterId !== id) : [...current, id],
    )
  }

  return (
    <div className="map-page">
      <h1 className="visually-hidden">Map</h1>

      <label className="search">
        <Search size={20} aria-hidden="true" />
        <span className="visually-hidden">Search places</span>
        <input
          className="search__input"
          type="search"
          placeholder="Search parks, water, dogs"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="filter-chips" aria-label="Filters">
        {FILTERS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className="chip"
            aria-pressed={activeFilters.includes(id)}
            onClick={() => toggleFilter(id)}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="map">
        <PlacesMap
          center={location}
          places={visiblePlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedId}
        />
      </div>

      <p className="map-status" aria-live="polite">
        {dataStatus === 'loading' && 'Finding places near you…'}
        {dataStatus === 'error' && (
          <>
            Couldn&apos;t load council data.{' '}
            <button type="button" className="map-status__retry" onClick={retry}>
              Try again
            </button>
          </>
        )}
        {dataStatus === 'ready' &&
          `${visiblePlaces.length} places within ${SEARCH_RADIUS_KM} km${
            locationStatus === 'found' ? ' of you' : ' of central Brisbane'
          }`}
      </p>

      <div aria-live="polite">
        {selectedPlace ? (
          <PlaceCard place={selectedPlace} />
        ) : (
          <p className="place-card place-card--empty">No places match your search.</p>
        )}
      </div>

      <p className="map-credit">
        Park data:{' '}
        <a href="https://data.brisbane.qld.gov.au/explore/" target="_blank" rel="noreferrer">
          Brisbane City Council open data
        </a>
      </p>
    </div>
  )
}

function PlaceCard({ place }) {
  const { icon: Icon, tone } = getFilter(place.type)
  return (
    <Link to="/coming-soon" className={`place-card tone-${tone}`}>
      <span className="place-card__icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <span className="place-card__text">
        <span className="place-card__name">{place.name}</span>
        <span className="place-card__detail">
          {formatDistance(place.distanceKm)} · {place.detail}
        </span>
      </span>
      <span className="place-card__arrow" aria-hidden="true">
        <ArrowRight size={18} strokeWidth={2.5} />
      </span>
    </Link>
  )
}
