import { useEffect, useState } from 'react'

// Used when the phone won't share its location (or the user says no).
export const BRISBANE_CBD = { lat: -27.4705, lon: 153.026 }

/**
 * Asks the browser where the user is.
 * status: 'locating' while asking, 'found' if we got it, 'default' if we fell back to the city.
 * Note: browsers only allow this on https:// sites (localhost is fine for development).
 */
export default function useUserLocation() {
  const [location, setLocation] = useState(BRISBANE_CBD)
  const [status, setStatus] = useState(() => (navigator.geolocation ? 'locating' : 'default'))

  useEffect(() => {
    if (!navigator.geolocation) return

    let cancelled = false
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (cancelled) return
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude })
        setStatus('found')
      },
      () => {
        if (!cancelled) setStatus('default')
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 },
    )

    return () => {
      cancelled = true
    }
  }, [])

  return { location, status }
}
