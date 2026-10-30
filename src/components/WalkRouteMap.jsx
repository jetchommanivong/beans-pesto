import { useCallback, useEffect } from 'react'
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip, useMap, ZoomControl } from 'react-leaflet'
import { Expand } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { BRISBANE_CBD } from '../context/locationContext.js'
import { routeSegments } from '../data/walkData.js'

function RouteView({ points }) {
  const map = useMap()
  const fitRoute = useCallback(() => {
    if (points.length === 1) map.setView([points[0].lat, points[0].lon], 17)
    else if (points.length > 1) map.fitBounds(points.map((point) => [point.lat, point.lon]), { padding: [28, 28], maxZoom: 17 })
  }, [map, points])

  // Fit when opening a route, then leave zooming and panning to the user.
  useEffect(fitRoute, [fitRoute])
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map])

  return <div className="walk-map__controls">
    <button type="button" onClick={fitRoute} aria-label="Fit whole route" title="Fit whole route"><Expand size={18} aria-hidden="true" /></button>
  </div>
}

export default function WalkRouteMap({ points }) {
  const first = points[0]
  const last = points.at(-1)
  return (
    <div className="walk-map" role="region" aria-label="Walk route map">
      <MapContainer center={first ? [first.lat, first.lon] : [BRISBANE_CBD.lat, BRISBANE_CBD.lon]} zoom={16} maxZoom={19} zoomControl={false} scrollWheelZoom touchZoom doubleClickZoom>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        <ZoomControl position="topright" />
        {routeSegments(points).filter((segment) => segment.length > 1).map((segment) => (
          <Polyline key={`${segment[0].segment}-${segment[0].at}`} positions={segment.map((point) => [point.lat, point.lon])} pathOptions={{ color: '#2f6b4f', weight: 5 }} />
        ))}
        {first && <CircleMarker center={[first.lat, first.lon]} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: '#2f6f9f', fillOpacity: 1 }}><Tooltip>Start</Tooltip></CircleMarker>}
        {last && <CircleMarker center={[last.lat, last.lon]} radius={7} pathOptions={{ color: '#fff', weight: 2, fillColor: '#2f6b4f', fillOpacity: 1 }}><Tooltip>Finish</Tooltip></CircleMarker>}
        <RouteView points={points} />
      </MapContainer>
    </div>
  )
}
