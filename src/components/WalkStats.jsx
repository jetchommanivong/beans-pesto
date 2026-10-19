import { formatWalkDistance, formatWalkDuration, walkDistance } from '../data/walkData.js'
import './Walks.css'

export default function WalkStats({ points, elapsedMs }) {
  return (
    <dl className="walk-stats">
      <div><dt>Distance</dt><dd>{formatWalkDistance(walkDistance(points))}</dd></div>
      <div><dt>Walking time</dt><dd>{formatWalkDuration(elapsedMs)}</dd></div>
    </dl>
  )
}
