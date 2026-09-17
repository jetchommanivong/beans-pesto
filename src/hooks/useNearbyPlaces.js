import { useCallback, useEffect, useState } from 'react'
import { fetchNearbyPlaces } from '../data/brisbaneOpenData.js'

/**
 * Loads council places near a point.
 * status: 'loading' | 'ready' | 'error'. Call retry() to try again after an error.
 */
export default function useNearbyPlaces({ lat, lon, radiusKm }) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, status: 'loading', places: [] })

  // Describes the data we want right now. If what we hold was loaded for a
  // different key, it belongs to an older request and we're still loading.
  const requestKey = `${lat},${lon},${radiusKm},${attempt}`
  const isCurrent = result.key === requestKey

  const retry = useCallback(() => setAttempt((current) => current + 1), [])

  useEffect(() => {
    // Cancels the request if the user leaves the page before it finishes.
    const controller = new AbortController()

    fetchNearbyPlaces({ lat, lon, radiusKm }, controller.signal)
      .then((places) => setResult({ key: requestKey, status: 'ready', places }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        console.error('Could not load Brisbane City Council data:', error)
        setResult({ key: requestKey, status: 'error', places: [] })
      })

    return () => controller.abort()
  }, [lat, lon, radiusKm, requestKey])

  return {
    places: isCurrent ? result.places : [],
    status: isCurrent ? result.status : 'loading',
    retry,
  }
}
