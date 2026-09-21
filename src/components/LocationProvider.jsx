import { useCallback, useEffect, useMemo, useState } from 'react'
import { BRISBANE_CBD, LocationContext } from '../context/locationContext.js'

// Remembers that the user already agreed, so we don't make them tap "Use my
// location" on every visit. Their browser still has the final say.
const STORAGE_KEY = 'tailmates.useMyLocation'

function hasAgreedBefore() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'yes'
  } catch {
    return false // private browsing can block storage
  }
}

function remember(agreed) {
  try {
    if (agreed) localStorage.setItem(STORAGE_KEY, 'yes')
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Not being able to remember the choice is fine, they can tap again.
  }
}

/**
 * Holds the location the whole app works from.
 *
 * We deliberately do NOT ask the browser for GPS when the app first opens: users
 * told us an unprompted location request feels like being tracked. The app starts
 * on central Brisbane and only asks once someone taps "Use my location" — after
 * that we remember the choice and locate them again on later visits.
 *
 * status: 'default' (city centre) | 'locating' | 'found' | 'denied'
 */
export default function LocationProvider({ children }) {
  const [location, setLocation] = useState(BRISBANE_CBD)
  // Whether this visit should locate the user without them asking again.
  const [askOnLoad] = useState(() => hasAgreedBefore() && Boolean(navigator.geolocation))
  const [status, setStatus] = useState(() => (askOnLoad ? 'locating' : 'default'))

  const handleFound = useCallback((position) => {
    setLocation({ lat: position.coords.latitude, lon: position.coords.longitude })
    setStatus('found')
    remember(true)
  }, [])

  const handleFailed = useCallback(() => setStatus('denied'), [])

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('denied')
      return
    }
    setStatus('locating')
    navigator.geolocation.getCurrentPosition(handleFound, handleFailed, {
      timeout: 8000,
      maximumAge: 5 * 60 * 1000,
    })
  }, [handleFound, handleFailed])

  const forgetLocation = useCallback(() => {
    setLocation(BRISBANE_CBD)
    setStatus('default')
    remember(false)
  }, [])

  // Returning visitors who already agreed: locate without prompting them again.
  useEffect(() => {
    if (!askOnLoad) return
    navigator.geolocation.getCurrentPosition(handleFound, handleFailed, {
      timeout: 8000,
      maximumAge: 5 * 60 * 1000,
    })
  }, [askOnLoad, handleFound, handleFailed])

  const value = useMemo(
    () => ({
      location,
      status,
      isPrecise: status === 'found',
      requestLocation,
      forgetLocation,
    }),
    [location, status, requestLocation, forgetLocation],
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}
