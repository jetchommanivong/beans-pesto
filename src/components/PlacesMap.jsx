import { useEffect, useMemo } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './PlacesMap.css'

const PIN_TONES = { parks: 'primary', water: 'water', dogs: 'accent' }

// Leaflet markers are plain HTML, not React, so these are the same three Lucide
// icons used elsewhere in the app written out as SVG (lucide.dev, ISC licence).
const PIN_GLYPHS = {
  parks:
    '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>',
  water:
    '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  dogs: '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
}

// Building a marker style is slightly expensive, so keep each one after the first use.
const iconCache = new Map()

function getPinIcon(type, isSelected) {
  const cacheKey = `${type}-${isSelected}`
  if (!iconCache.has(cacheKey)) {
    const html = `<span class="map-pin tone-${PIN_TONES[type]}${isSelected ? ' map-pin--selected' : ''}">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${PIN_GLYPHS[type]}</svg>
      </span>`
    iconCache.set(
      cacheKey,
      L.divIcon({ html, className: 'map-pin-wrapper', iconSize: [32, 32], iconAnchor: [16, 32] }),
    )
  }
  return iconCache.get(cacheKey)
}

// Keeps the map centred on the user, and eases across when a place is chosen.
function MapView({ center, selectedPlace }) {
  const map = useMap()

  // Leaflet measures its box once when it starts. On a phone the layout is often
  // still settling at that moment, which leaves the map blank, so re-measure on resize.
  useEffect(() => {
    const container = map.getContainer()
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])

  useEffect(() => {
    map.setView([center.lat, center.lon], map.getZoom())
  }, [map, center.lat, center.lon])

  useEffect(() => {
    if (selectedPlace) {
      map.panTo([selectedPlace.lat, selectedPlace.lon])
    }
  }, [map, selectedPlace])

  return null
}

export default function PlacesMap({ center, places, selectedPlace, onSelectPlace }) {
  const startPosition = useMemo(() => [center.lat, center.lon], [center.lat, center.lon])

  return (
    <MapContainer
      className="places-map"
      center={startPosition}
      zoom={14}
      zoomControl={false}
      scrollWheelZoom
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />

      {/* The outline of the selected off-leash area, where the council publishes one */}
      {selectedPlace?.shape && (
        <GeoJSON
          key={selectedPlace.id}
          data={selectedPlace.shape}
          style={{ color: '#2f6b4f', weight: 2, fillColor: '#2f6b4f', fillOpacity: 0.18 }}
        />
      )}

      {/* Where the user is */}
      <CircleMarker
        center={startPosition}
        radius={8}
        pathOptions={{ color: '#fff', weight: 3, fillColor: '#2f6f9f', fillOpacity: 1 }}
      />

      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.lat, place.lon]}
          icon={getPinIcon(place.type, place.id === selectedPlace?.id)}
          title={place.name}
          alt={place.name}
          zIndexOffset={place.id === selectedPlace?.id ? 1000 : 0}
          eventHandlers={{ click: () => onSelectPlace(place.id) }}
        />
      ))}

      <MapView center={center} selectedPlace={selectedPlace} />
    </MapContainer>
  )
}
