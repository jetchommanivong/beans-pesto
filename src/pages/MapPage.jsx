import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Bone, Crosshair, Droplet, Fence, MapPin, PawPrint, Search, TreePine } from 'lucide-react'
import PlacesMap from '../components/PlacesMap.jsx'
import useCheckIns from '../hooks/useCheckIns.js'
import useNearbyPlaces from '../hooks/useNearbyPlaces.js'
import useUserLocation from '../hooks/useUserLocation.js'
import { SIZE_BANDS, formatDistance } from '../data/brisbaneOpenData.js'
import './MapPage.css'

const SEARCH_RADIUS_KM = 3

// One colour per place type, used by the chips, the pins, the list and the legend.
const FILTERS = [
  { id: 'parks', label: 'Parks', singular: 'park', icon: TreePine, tone: 'primary' },
  { id: 'dogParks', label: 'Dog parks', singular: 'dog park', icon: PawPrint, tone: 'accent' },
  { id: 'water', label: 'Water', singular: 'water stop', icon: Droplet, tone: 'water' },
]
const FILTER_IDS = FILTERS.map((filter) => filter.id)

// Dog parks and water are what a walk is planned around. Every council park as
// well is too much on a phone screen, so that layer starts off.
const DEFAULT_FILTER_IDS = ['dogParks', 'water']

export default function MapPage() {
  const [searchParams] = useSearchParams()
  const startingFilter = searchParams.get('filter')
  // Home links to a specific place, e.g. "/map?filter=parks&place=dog-park-42".
  const startingPlaceId = searchParams.get('place')

  // The key resets the map when the link changes, e.g. "/map?filter=water" to "/map".
  return (
    <MapScreen
      key={`${startingFilter ?? 'all'}-${startingPlaceId ?? ''}`}
      startingFilter={startingFilter}
      startingPlaceId={startingPlaceId}
    />
  )
}

function MapScreen({ startingFilter, startingPlaceId }) {
  const { location, status: locationStatus, isPrecise, requestLocation } = useUserLocation()
  const {
    places: councilPlaces,
    status: dataStatus,
    retry,
  } = useNearbyPlaces({ lat: location.lat, lon: location.lon, radiusKm: SEARCH_RADIUS_KM })
  const { myCheckIn, checkIn, checkOut, presenceByPlace } = useCheckIns(councilPlaces)

  const [activeFilters, setActiveFilters] = useState(() =>
    FILTER_IDS.includes(startingFilter) ? [startingFilter] : DEFAULT_FILTER_IDS,
  )
  const [activeSizes, setActiveSizes] = useState([])
  const [fencedOnly, setFencedOnly] = useState(false)
  const [dogBowlOnly, setDogBowlOnly] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(startingPlaceId)

  const showsDogParks = activeFilters.includes('dogParks')
  const showsWater = activeFilters.includes('water')

  // Only dog parks carry fencing and size; only fountains carry a dog bowl.
  function matchesRefinements(place) {
    if (place.type === 'dogParks') {
      if (fencedOnly && !place.isFenced) return false
      if (activeSizes.length > 0 && !activeSizes.includes(place.sizeBand)) return false
    }
    if (place.type === 'water' && dogBowlOnly && !place.hasDogBowl) return false
    return true
  }

  const searchText = query.trim().toLowerCase()
  // councilPlaces arrives sorted by distance, so this stays nearest-first.
  const visiblePlaces = councilPlaces.filter(
    (place) =>
      activeFilters.includes(place.type) &&
      place.name.toLowerCase().includes(searchText) &&
      matchesRefinements(place),
  )

  const selectedPlace = visiblePlaces.find((place) => place.id === selectedId) ?? null

  // The nearest of each type currently showing, for the quick list below the map.
  const nearestByType = FILTERS.filter((filter) => activeFilters.includes(filter.id)).map(
    (filter) => ({
      filter,
      place: visiblePlaces.find((place) => place.type === filter.id) ?? null,
    }),
  )

  function toggleIn(values, id) {
    return values.includes(id) ? values.filter((value) => value !== id) : [...values, id]
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
          placeholder="Search parks, dog parks, water"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <div className="filter-chips" aria-label="Place types">
        {FILTERS.map(({ id, label, icon: Icon, tone }) => (
          <button
            key={id}
            type="button"
            className={`chip tone-${tone}`}
            aria-pressed={activeFilters.includes(id)}
            onClick={() => setActiveFilters((current) => toggleIn(current, id))}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {(showsDogParks || showsWater) && (
        <div className="filter-chips filter-chips--refine" aria-label="Refine results">
          {showsDogParks && (
            <>
              <button
                type="button"
                className="chip chip--small"
                aria-pressed={fencedOnly}
                onClick={() => setFencedOnly((current) => !current)}
              >
                <Fence size={14} aria-hidden="true" />
                Fenced only
              </button>
              {SIZE_BANDS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className="chip chip--small"
                  aria-pressed={activeSizes.includes(id)}
                  onClick={() => setActiveSizes((current) => toggleIn(current, id))}
                >
                  {label}
                </button>
              ))}
            </>
          )}
          {showsWater && (
            <button
              type="button"
              className="chip chip--small"
              aria-pressed={dogBowlOnly}
              onClick={() => setDogBowlOnly((current) => !current)}
            >
              <Bone size={14} aria-hidden="true" />
              Has dog bowl
            </button>
          )}
        </div>
      )}

      <div className="map">
        <PlacesMap
          center={location}
          places={visiblePlaces}
          selectedPlace={selectedPlace}
          onSelectPlace={setSelectedId}
          presenceByPlace={presenceByPlace}
          myCheckIn={myCheckIn}
          onCheckIn={checkIn}
          onCheckOut={checkOut}
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
        {dataStatus === 'ready' && (
          <>
            {`${visiblePlaces.length} places within ${SEARCH_RADIUS_KM} km ${
              isPrecise ? 'of you' : 'of central Brisbane'
            }`}
            {!isPrecise && (
              <button type="button" className="map-status__locate" onClick={requestLocation}>
                <Crosshair size={14} aria-hidden="true" />
                {locationStatus === 'locating' ? 'Finding you…' : 'Use my location'}
              </button>
            )}
          </>
        )}
      </p>

      {myCheckIn && (
        <p className="check-in-banner" aria-live="polite">
          <MapPin size={16} aria-hidden="true" />
          <span>
            You&apos;re at <strong>{myCheckIn.placeName}</strong> · visible for{' '}
            {myCheckIn.minutesLeft} more min
          </span>
          <button type="button" className="check-in-banner__button" onClick={checkOut}>
            Check out
          </button>
        </p>
      )}

      <ul className="nearest-list" aria-label="Closest to you">
        {nearestByType.map(({ filter, place }) => (
          <NearestRow
            key={filter.id}
            filter={filter}
            place={place}
            ownersHere={place ? (presenceByPlace.get(place.id)?.length ?? 0) : 0}
            isSelected={place !== null && place.id === selectedPlace?.id}
            onSelect={setSelectedId}
          />
        ))}
      </ul>

      <p className="map-credit">
        Park, dog park and water data:{' '}
        <a href="https://data.brisbane.qld.gov.au/explore/" target="_blank" rel="noreferrer">
          Brisbane City Council open data
        </a>
        . Other owners shown are sample data.
      </p>
    </div>
  )
}

// One row per type, doubling as the map's legend: the icon and colour here are
// the same ones used by that type's pins.
function NearestRow({ filter, place, ownersHere, isSelected, onSelect }) {
  const { label, singular, icon: Icon, tone } = filter

  if (!place) {
    return (
      <li className={`nearest tone-${tone} nearest--empty`}>
        <span className="nearest__icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="nearest__text">
          <span className="nearest__type">{label}</span>
          <span className="nearest__name">None match your filters</span>
        </span>
      </li>
    )
  }

  return (
    <li className={`nearest tone-${tone}`}>
      <button
        type="button"
        className="nearest__button"
        aria-pressed={isSelected}
        onClick={() => onSelect(place.id)}
      >
        <span className="nearest__icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <span className="nearest__text">
          <span className="nearest__type">Nearest {singular}</span>
          <span className="nearest__name">{place.name}</span>
          <span className="nearest__detail">
            {ownersHere > 0 ? `${ownersHere} here now · ${place.detail}` : place.detail}
          </span>
        </span>
        <span className="nearest__distance">{formatDistance(place.distanceKm)}</span>
      </button>
    </li>
  )
}
