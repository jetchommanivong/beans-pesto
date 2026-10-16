// Live data from Brisbane City Council's open data portal.
// Browse the datasets here: https://data.brisbane.qld.gov.au/explore/

const API_BASE = 'https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets'

export const DATASETS = {
  dogParks: 'park-dog-off-leash-areas',
  parks: 'park-locations',
  fountains: 'park-drinking-fountain-tap-locations',
}

// The council's API refuses anything above 100 records in one request. There are
// more than that near the city (243 fountains and 118 parks within 3km of the
// CBD), so we always ask for the closest ones first and show that many.
const MAX_RECORDS = 100

// How many of the nearest places to show per dataset. There are far more parks
// and fountains than dog parks, so fewer of them keeps the map readable. Raise
// these (up to 100) if we want to show more places.
const NEARBY_LIMITS = { dogParks: 40, parks: 12, fountains: 15 }

/**
 * Asks the council for records of one dataset within `radiusKm` of a point,
 * nearest first. `signal` lets React cancel the request if the user navigates away.
 */
async function fetchRecords(dataset, { lat, lon, radiusKm, limit, geoField, select }, signal) {
  const point = `geom'POINT(${lon} ${lat})'`
  const params = new URLSearchParams({
    where: `within_distance(${geoField}, ${point}, ${radiusKm}km)`,
    order_by: `distance(${geoField}, ${point})`,
    limit: String(Math.min(limit, MAX_RECORDS)),
  })
  if (select) {
    params.set('select', select)
  }

  const response = await fetch(`${API_BASE}/${dataset}/records?${params}`, { signal })
  if (!response.ok) {
    throw new Error(`Brisbane City Council API returned ${response.status}`)
  }

  const data = await response.json()
  return data.results ?? []
}

// The council stores names in capitals: "PIONEER CRESCENT PARK" -> "Pioneer Crescent Park"
function toTitleCase(text) {
  return (text ?? '')
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .trim()
}

// Size bands. The council publishes a ready-made band on park-locations, but only
// a raw area on the dog off-leash areas, so we re-use the council's own
// thresholds for both and the two datasets read the same way on screen.
export const SIZE_BANDS = [
  { id: 'small', label: 'Small', upToSqm: 2500 },
  { id: 'medium', label: 'Medium', upToSqm: 10000 },
  { id: 'large', label: 'Large', upToSqm: Infinity },
]

const SIZE_LABELS = Object.fromEntries(SIZE_BANDS.map(({ id, label }) => [id, label]))

function sizeBandFromArea(sqm) {
  if (typeof sqm !== 'number') return null
  return SIZE_BANDS.find((band) => sqm <= band.upToSqm).id
}

// park-locations states the band as text, e.g. "2500 - 5000 sq metres" or "10000+
// sq metres". The leading number is the band's lower bound.
function sizeBandFromParkSize(text) {
  const lowerBound = Number.parseInt(text ?? '', 10)
  if (Number.isNaN(lowerBound)) return null
  if (lowerBound < 2500) return 'small'
  return lowerBound < 10000 ? 'medium' : 'large'
}

const FENCING_LABELS = {
  'FULLY FENCED': 'Fully fenced',
  'PARTIALLY FENCED': 'Partly fenced',
  UNFENCED: 'Unfenced',
}

function toDogPark(record) {
  const sizeBand = sizeBandFromArea(record.shape_area)
  // The council records a separate small-dog enclosure but never a "large dog"
  // or "mixed" category, so a park without an enclosure is one shared space.
  const hasSmallDogArea = record.small_dog_enclosure === 'YES'

  // `detail` is the one-line summary used in lists; `tags` are short badges for
  // the map popup. Both stay deliberately short: a popup on a phone has room for
  // a glance, not for every column the council publishes.
  const detail = [sizeBand && `${SIZE_LABELS[sizeBand]} park`, FENCING_LABELS[record.fencing]]
    .filter(Boolean)
    .join(' · ')

  // Badges carry features a park has. A park with no small-dog enclosure is just
  // the ordinary shared kind, so that is left unsaid rather than badged.
  const tags = [
    hasSmallDogArea && 'Small dog area',
    record.dog_agility_equipment === 'YES' && 'Agility',
    record.lighting === 'YES' && 'Lit',
  ].filter(Boolean)

  return {
    id: `dog-park-${record.objectid}`,
    type: 'dogParks',
    name: toTitleCase(record.park_name || record.item_description || 'Dog off-leash area'),
    detail,
    suburb: toTitleCase(record.suburb),
    tags,
    lat: record.geo_point_2d?.lat,
    lon: record.geo_point_2d?.lon,
    shape: record.geo_shape ?? null, // the outline of the off-leash area
    isFenced: record.fencing === 'FULLY FENCED',
    hasSmallDogArea,
    sizeBand,
  }
}

function toPark(record) {
  const sizeBand = sizeBandFromParkSize(record.park_size)
  return {
    id: `park-${record.objectid}`,
    type: 'parks',
    name: toTitleCase(record.park_name || 'Park'),
    detail: sizeBand ? `${SIZE_LABELS[sizeBand]} park` : 'Park',
    suburb: toTitleCase(record.suburb),
    // Nothing worth badging: the size is already the whole of `detail`.
    tags: [],
    lat: record.geopoint?.lat,
    lon: record.geopoint?.lon,
    shape: null,
    sizeBand,
  }
}

function toFountain(record) {
  // Descriptions look like "BUBBLER & 2 TAPS" or "BUBBLER 2 TAP DOG BOWL". Match
  // "dog bowl" rather than "bowl" alone, which also catches "BOWL FOUNTAIN".
  const hasDogBowl = /DOG\s*BOWL/i.test(record.item_description ?? '')
  return {
    id: `fountain-${record.objectid}`,
    type: 'water',
    name: toTitleCase(record.park_name || 'Drinking fountain'),
    detail: hasDogBowl ? 'Drinking fountain with dog bowl' : 'Drinking fountain',
    suburb: toTitleCase(record.suburb),
    // Only badge the dog bowl when there is one; its absence is not a feature.
    tags: hasDogBowl ? ['Dog bowl'] : [],
    lat: record.geo_point_2d?.lat,
    lon: record.geo_point_2d?.lon,
    shape: null,
    hasDogBowl,
  }
}

/** Distance between two points in kilometres */
export function distanceInKm(from, to) {
  const earthRadiusKm = 6371
  const toRadians = (degrees) => (degrees * Math.PI) / 180
  const deltaLat = toRadians(to.lat - from.lat)
  const deltaLon = toRadians(to.lon - from.lon)
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(deltaLon / 2) ** 2
  return earthRadiusKm * 2 * Math.asin(Math.sqrt(a))
}

export function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`
}

/**
 * Fetches dog off-leash areas, parks and drinking fountains near a point,
 * and returns them as one list sorted by distance.
 */
export async function fetchNearbyPlaces({ lat, lon, radiusKm }, signal) {
  const [dogParkRecords, parkRecords, fountainRecords] = await Promise.all([
    fetchRecords(
      DATASETS.dogParks,
      { lat, lon, radiusKm, limit: NEARBY_LIMITS.dogParks, geoField: 'geo_point_2d' },
      signal,
    ),
    fetchRecords(
      DATASETS.parks,
      {
        lat,
        lon,
        radiusKm,
        limit: NEARBY_LIMITS.parks,
        geoField: 'geopoint',
        // Skipping geo_shape keeps this response small; only dog parks are outlined.
        select: 'objectid,park_name,suburb,park_size,geopoint',
      },
      signal,
    ),
    fetchRecords(
      DATASETS.fountains,
      { lat, lon, radiusKm, limit: NEARBY_LIMITS.fountains, geoField: 'geo_point_2d' },
      signal,
    ),
  ])

  return [
    ...dogParkRecords.map(toDogPark),
    ...parkRecords.map(toPark),
    ...fountainRecords.map(toFountain),
  ]
    .filter((place) => typeof place.lat === 'number' && typeof place.lon === 'number')
    .map((place) => ({ ...place, distanceKm: distanceInKm({ lat, lon }, place) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
}
