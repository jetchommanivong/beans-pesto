import { createContext } from 'react'

// Where the map starts before (or without) the user sharing their location.
export const BRISBANE_CBD = { lat: -27.4705, lon: 153.026 }

// Set up by LocationProvider, read through the useUserLocation hook.
export const LocationContext = createContext(null)
