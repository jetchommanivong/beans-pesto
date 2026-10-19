import { useEffect, useState } from 'react'
import { Circle, CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import { Expand, LocateFixed } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { BRISBANE_CBD } from '../context/locationContext.js'
import { routeSegments } from '../data/walkData.js'

function RouteView({ points, recording }) {
  const map = useMap()
  const [following, setFollowing] = useState(true)
  useMapEvents({ dragstart: () => setFollowing(false) })

  function fitRoute() {
    if (points.length === 1) map.setView([points[0].lat, points[0].lon], 17)
    else if (points.length > 1) map.fitBounds(points.map((point) => [point.lat, point.lon]), { padding: [28, 28], maxZoom: 17 })
  }

  useEffect(() => {
    if (recording && following && points.length) {
      const point = points.at(-1)
      map.setView([point.lat, point.lon], Math.max(map.getZoom(), 16))
    } else if (!recording) fitRoute()
    // Map positions follow accepted fixes, not component renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, recording, following, map])

  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  return (
    <div className="walk-map__controls">
      <button type="button" onClick={() => { setFollowing(false); fitRoute() }} aria-label="Fit whole route" title="Fit whole route">
        <Expand size={18} aria-hidden="true" />
      </button>
      {recording && <button type="button" aria-label="Follow my location" title="Follow my location" onClick={() => setFollowing(true)}>
        <LocateFixed size={18} aria-hidden="true" />
      </button>}
    </div>
  )
}

export default function WalkRouteMap({ points, recording }) {
  const first = points[0]
  const last = points.at(-1)
  return (
    <div className="walk-map" role="region" aria-label="Walk route map">
      <MapContainer center={first ? [first.lat, first.lon] : [BRISBANE_CBD.lat, BRISBANE_CBD.lon]} zoom={16} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {routeSegments(points).filter((segment) => segment.length > 1).map((segment) => (
          <Polyline key={`${segment[0].segment}-${segment[0].at}`} positions={segment.map((point) => [point.lat, point.lon])} pathOptions={{ color: '#2f6b4f', weight: 5 }} />
        ))}
        {first && <CircleMarker center={[first.lat, first.lon]} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: '#2f6f9f', fillOpacity: 1 }}><Tooltip>Start</Tooltip></CircleMarker>}
        {last && <>
          {recording && <Circle center={[last.lat, last.lon]} radius={last.accuracy} pathOptions={{ color: '#2f6b4f', weight: 1, fillOpacity: 0.08 }} />}
          <CircleMarker center={[last.lat, last.lon]} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: '#2f6b4f', fillOpacity: 1 }}><Tooltip>{recording ? 'Latest location' : 'Finish'}</Tooltip></CircleMarker>
        </>}
        <RouteView points={points} recording={recording} />
      </MapContainer>
    </div>
  )
}
