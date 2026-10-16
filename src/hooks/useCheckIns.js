import { useCallback, useEffect, useMemo, useState } from 'react'
import { owners } from '../data/mockData.js'

const STORAGE_KEY = 'tailmates.checkin'

// A check-in says "I am at this park now", so it has to stop being true on its
// own. Checking in is the consent: there is no background or continuous sharing.
export const CHECK_IN_MINUTES = 60

// The sample owners are spread across this many of the nearest dog parks, so
// there is always someone to meet wherever the demo is run from.
const SEEDED_PARK_COUNT = 3

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    // Private browsing or blocked site data. Check-ins just will not persist.
    return null
  }
}

function writeStored(value) {
  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // As above: the check-in still works for this session.
  }
}

function minutesLeft(checkIn, now) {
  return Math.ceil((checkIn.at + CHECK_IN_MINUTES * 60_000 - now) / 60_000)
}

/**
 * The user's own park check-in, plus which sample owners are at which park.
 * Pass the full list of nearby council places.
 */
export default function useCheckIns(places) {
  const [stored, setStored] = useState(readStored)
  const [now, setNow] = useState(() => Date.now())

  // Keeps the remaining time honest so an expired check-in clears itself.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(timer)
  }, [])

  const myCheckIn = useMemo(() => {
    if (!stored) return null
    const remaining = minutesLeft(stored, now)
    return remaining > 0 ? { ...stored, minutesLeft: remaining } : null
  }, [stored, now])

  const checkIn = useCallback((place) => {
    const next = { placeId: place.id, placeName: place.name, at: Date.now() }
    writeStored(next)
    setStored(next)
    setNow(Date.now())
  }, [])

  const checkOut = useCallback(() => {
    writeStored(null)
    setStored(null)
  }, [])

  const presenceByPlace = useMemo(() => {
    const parks = places.filter((place) => place.type === 'dogParks').slice(0, SEEDED_PARK_COUNT)
    const byPlace = new Map()
    if (parks.length === 0) return byPlace

    owners.forEach((owner, index) => {
      const park = parks[index % parks.length]
      byPlace.set(park.id, [...(byPlace.get(park.id) ?? []), owner])
    })
    return byPlace
  }, [places])

  return { myCheckIn, checkIn, checkOut, presenceByPlace }
}
