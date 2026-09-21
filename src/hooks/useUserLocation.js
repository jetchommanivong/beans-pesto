import { useContext } from 'react'
import { LocationContext } from '../context/locationContext.js'

/**
 * The location every screen works from, shared by LocationProvider.
 * Returns { location, status, isPrecise, requestLocation, forgetLocation }.
 */
export default function useUserLocation() {
  const value = useContext(LocationContext)
  if (!value) {
    throw new Error('useUserLocation must be used inside <LocationProvider>')
  }
  return value
}
