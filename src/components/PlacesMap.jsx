import { useEffect, useMemo, useRef } from 'react'
import { CircleMarker, GeoJSON, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { Users } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// Only the animation/spiderfy styles. MarkerCluster.Default.css is left out
// because the count bubbles are styled in PlacesMap.css to match the app.
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css'
import { formatDistance } from '../data/brisbaneOpenData.js'
import './PlacesMap.css'

// One colour per place type, matching the filter chips and the list on MapPage.
const PIN_TONES = { parks: 'primary', dogParks: 'accent', water: 'water' }

// Dog parks are what people come here for, so they get the largest pin. Fountains
// are the most numerous by far, so they sit back as small dots rather than
// competing with the places you would actually walk to.
const PIN_SIZES = {
  dogParks: { box: 38, glyph: 18, dot: false },
  parks: { box: 30, glyph: 14, dot: false },
  water: { box: 22, glyph: 12, dot: true },
}

// Leaflet markers are plain HTML, not React, so these are the same Lucide icons
// used elsewhere in the app written out as SVG (lucide.dev, ISC licence).
const PIN_GLYPHS = {
  parks:
    '<path d="m17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z"/><path d="M12 22v-3"/>',
  water:
    '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  dogParks:
    '<circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z"/>',
}

// Building a marker style is slightly expensive, so keep each one after the first use.
const iconCache = new Map()

function getPinIcon(type, isSelected) {
  const cacheKey = `${type}-${isSelected}`
  if (!iconCache.has(cacheKey)) {
    const { box, glyph, dot } = PIN_SIZES[type]
    const classes = [
      'map-pin',
      `tone-${PIN_TONES[type]}`,
      dot && 'map-pin--dot',
      isSelected && 'map-pin--selected',
    ].filter(Boolean)

    const html = `<span class="${classes.join(' ')}" style="width:${box}px;height:${box}px">
        <svg viewBox="0 0 24 24" width="${glyph}" height="${glyph}" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${PIN_GLYPHS[type]}</svg>
      </span>`
    iconCache.set(
      cacheKey,
      L.divIcon({
        html,
        className: 'map-pin-wrapper',
        iconSize: [box, box],
        // A teardrop points at its location; a dot is centred on it.
        iconAnchor: dot ? [box / 2, box / 2] : [box / 2, box],
      }),
    )
  }
  return iconCache.get(cacheKey)
}

// Who is at a dog park, and one action. The reassurance about what check-in
// shares, and the time remaining, live on the banner under the map instead of
// being repeated inside every bubble.
function CheckInPanel({ place, owners, myCheckIn, onCheckIn, onCheckOut }) {
  const isHere = myCheckIn?.placeId === place.id

  return (
    <div className="check-in">
      <span className="check-in__count">
        <Users size={13} aria-hidden="true" />
        {owners.length > 0 ? `${owners.length} here now` : 'Nobody here'}
      </span>
      {isHere ? (
        <button type="button" className="check-in__button" onClick={onCheckOut}>
          Check out
        </button>
      ) : (
        <button
          type="button"
          className="check-in__button check-in__button--go"
          onClick={() => onCheckIn(place)}
        >
          Check in
        </button>
      )}
    </div>
  )
}

// A cluster stands for a mix of types, so it stays neutral rather than borrowing
// one type's colour. It only ever appears where pins would otherwise overlap.
function createClusterIcon(cluster) {
  const count = cluster.getChildCount()
  const box = count < 10 ? 32 : 38
  return L.divIcon({
    html: `<span class="map-cluster" style="width:${box}px;height:${box}px">${count}</span>`,
    className: 'map-cluster-wrapper',
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
  })
}

// Keeps the map centred on the user.
function MapView({ center }) {
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

  return null
}

export default function PlacesMap({
  center,
  places,
  selectedPlace,
  onSelectPlace,
  presenceByPlace,
  myCheckIn,
  onCheckIn,
  onCheckOut,
}) {
  const startPosition = useMemo(() => [center.lat, center.lon], [center.lat, center.lon])
  const markersById = useRef(new Map())
  const mapRef = useRef(null)
  const clusterRef = useRef(null)

  // Choosing a place from the list below the map should open its popup too. A
  // marker collapsed into a cluster has no popup to open yet, so the cluster has
  // to be broken apart first.
  useEffect(() => {
    const map = mapRef.current
    const marker = selectedPlace && markersById.current.get(selectedPlace.id)
    if (!map || !marker) return

    const cluster = clusterRef.current
    if (cluster?.hasLayer(marker)) {
      cluster.zoomToShowLayer(marker, () => marker.openPopup())
    } else {
      map.panTo(marker.getLatLng())
      marker.openPopup()
    }
  }, [selectedPlace])

  return (
    <MapContainer
      className="places-map"
      center={startPosition}
      zoom={14}
      // Marker clustering throws if the map has no finite maximum zoom. It would
      // otherwise only be set as a side effect of the tile layer mounting first.
      maxZoom={19}
      zoomControl={false}
      scrollWheelZoom
      ref={mapRef}
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
          style={{ color: '#a95b16', weight: 2, fillColor: '#a95b16', fillOpacity: 0.18 }}
        />
      )}

      {/* Where the user is */}
      <CircleMarker
        center={startPosition}
        radius={8}
        pathOptions={{ color: '#fff', weight: 3, fillColor: '#2f6f9f', fillOpacity: 1 }}
      />

      <MarkerClusterGroup
        ref={clusterRef}
        iconCreateFunction={createClusterIcon}
        maxClusterRadius={50}
        showCoverageOnHover={false}
        disableClusteringAtZoom={17}
      >
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lon]}
            icon={getPinIcon(place.type, place.id === selectedPlace?.id)}
            title={place.name}
            alt={place.name}
            zIndexOffset={place.id === selectedPlace?.id ? 1000 : 0}
            ref={(marker) => {
              if (marker) {
                markersById.current.set(place.id, marker)
              } else {
                markersById.current.delete(place.id)
              }
            }}
            eventHandlers={{ click: () => onSelectPlace(place.id) }}
          >
            <Popup
              className={`place-popup tone-${PIN_TONES[place.type]}`}
              closeButton={false}
              minWidth={170}
              maxWidth={230}
            >
              <span className="place-popup__name">{place.name}</span>
              <span className="place-popup__meta">
                {formatDistance(place.distanceKm)}
                {place.suburb ? ` · ${place.suburb}` : ''}
              </span>
              <span className="place-popup__detail">{place.detail}</span>
              {place.tags.length > 0 && (
                <span className="place-popup__tags">
                  {place.tags.map((tag) => (
                    <span key={tag} className="place-popup__tag">
                      {tag}
                    </span>
                  ))}
                </span>
              )}
              {place.type === 'dogParks' && (
                <CheckInPanel
                  place={place}
                  owners={presenceByPlace.get(place.id) ?? []}
                  myCheckIn={myCheckIn}
                  onCheckIn={onCheckIn}
                  onCheckOut={onCheckOut}
                />
              )}
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>

      <MapView center={center} />
    </MapContainer>
  )
}
