import { lazy, Suspense } from 'react'
import './Walks.css'

const WalkRouteMap = lazy(() => import('./WalkRouteMap.jsx'))

export default function WalkMap({ points, recording = false }) {
  const placeholder = <div className="walk-map walk-map--loading">Loading route map…</div>
  if (typeof window === 'undefined') return placeholder
  return <Suspense fallback={placeholder}><WalkRouteMap points={points} recording={recording} /></Suspense>
}
