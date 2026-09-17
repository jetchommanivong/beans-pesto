// Live data from Brisbane City Council's open data portal.
// Browse the datasets here: https://data.brisbane.qld.gov.au/explore/
//


const API_BASE = 'https://data.brisbane.qld.gov.au/api/explore/v2.1/catalog/datasets'

export const DATASETS = {
  dogParks: 'park-dog-off-leash-areas',
  fountains: 'park-drinking-fountain-tap-locations',
}

// The council's API refuses anything above 100 records in one request. There are
// more than that near the city (243 fountains within 3km of the CBD), so we always
// ask for the closest ones first and show that many.
const MAX_RECORDS = 100

// How many of the nearest places to show per dataset. There are far more
// fountains than dog parks, so fewer of them keeps the map readable. Raise these
// (up to 100) if we want to show more places, but the council's API will still only return 100 at a time.
const NEARBY_LIMITS = { dogParks: 40, fountains: 25 }

/**
 * Asks the council for records of one dataset within `radiusKm` of a point,
 * nearest first. `signal` lets React cancel the request if the user navigates away.
 */
async function fetchRecords(dataset, { lat, lon, radiusKm, limit }, signal) {
  const point = `geom'POINT(${lon} ${lat})'`
  const params = new URLSearchParams({
    where: `within_distance(geo_point_2d, ${point}, ${radiusKm}km)`,
    order_by: `distance(geo_point_2d, ${point})`,
    limit: String(Math.min(limit, MAX_RECORDS)),
  })

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

// Turns the council's separate YES/NO columns into one short line of text.
function describeDogPark(record) {
  const features = []
  if (record.fencing === 'FULLY FENCED') features.push('Fully fenced')
  if (record.fencing === 'PARTIALLY FENCED') features.push('Partly fenced')
  if (record.fencing === 'UNFENCED') features.push('Unfenced')
  if (record.small_dog_enclosure === 'YES') features.push('Small dog area')
  if (record.dog_agility_equipment === 'YES') features.push('Agility equipment')
  if (record.lighting === 'YES') features.push('Lit at night')
  return features.join(' · ') || 'Dog off-leash area'
}

function toDogPark(record) {
  return {
    id: `dog-park-${record.objectid}`,
    type: 'parks',
    name: toTitleCase(record.park_name || record.item_description || 'Dog off-leash area'),
    detail: describeDogPark(record),
    suburb: toTitleCase(record.suburb),
    lat: record.geo_point_2d?.lat,
    lon: record.geo_point_2d?.lon,
    shape: record.geo_shape ?? null, // the outline of the off-leash area
    facilities: {
      fencing: toTitleCase(record.fencing),
      lighting: record.lighting === 'YES',
      smallDogEnclosure: record.small_dog_enclosure === 'YES',
      agilityEquipment: record.dog_agility_equipment === 'YES',
    },
  }
}

function toFountain(record) {
  // Descriptions look like "BUBBLER, TAP & DOG BOWL" can display with dog bowls as well found in the dataset
  const hasDogBowl = /BOWL/i.test(record.item_description ?? '')
  return {
    id: `fountain-${record.objectid}`,
    type: 'water',
    name: toTitleCase(record.park_name || 'Drinking fountain'),
    detail: hasDogBowl ? 'Drinking fountain with dog bowl' : 'Drinking fountain',
    hasDogBowl,
    lat: record.geo_point_2d?.lat,
    lon: record.geo_point_2d?.lon,
    shape: null,
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
 * Fetches dog off-leash areas and drinking fountains near a point,
 * and returns them as one list sorted by distance.
 */
export async function fetchNearbyPlaces({ lat, lon, radiusKm }, signal) {
  const [dogParkRecords, fountainRecords] = await Promise.all([
    fetchRecords(DATASETS.dogParks, { lat, lon, radiusKm, limit: NEARBY_LIMITS.dogParks }, signal),
    fetchRecords(DATASETS.fountains, { lat, lon, radiusKm, limit: NEARBY_LIMITS.fountains }, signal),
  ])

  return [...dogParkRecords.map(toDogPark), ...fountainRecords.map(toFountain)]
    .filter((place) => typeof place.lat === 'number' && typeof place.lon === 'number')
    .map((place) => ({ ...place, distanceKm: distanceInKm({ lat, lon }, place) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
}
