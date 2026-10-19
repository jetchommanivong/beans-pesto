export const WALK_STORAGE_KEY = 'tailmates.walks.v1'
export const MAX_GPS_ACCURACY = 75
const MAX_POINTS = 20000

export const newWalkId = () => globalThis.crypto?.randomUUID?.() ?? `walk-${Date.now()}-${Math.random().toString(36).slice(2)}`

export function validPoint(point) {
  return point && Number.isFinite(point.lat) && Math.abs(point.lat) <= 90 &&
    Number.isFinite(point.lon) && Math.abs(point.lon) <= 180 &&
    Number.isFinite(point.at) && point.at >= 0 &&
    Number.isFinite(point.accuracy) && point.accuracy >= 0 &&
    Number.isInteger(point.segment) && point.segment >= 0
}

export function distanceMetres(a, b) {
  const radians = Math.PI / 180
  const lat = (b.lat - a.lat) * radians
  const lon = (b.lon - a.lon) * radians
  const h = Math.sin(lat / 2) ** 2 + Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin(lon / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)))
}

// Ignore poor fixes, stationary jitter and implausible jumps. A missing section
// is a new segment, rather than an invented straight line across a GPS gap.
export function acceptPosition(draft, position, now = Date.now()) {
  const point = {
    lat: position.coords?.latitude, lon: position.coords?.longitude,
    accuracy: position.coords?.accuracy, at: position.timestamp, segment: draft.segment,
  }
  if (!validPoint(point) || point.accuracy > MAX_GPS_ACCURACY || point.at < draft.activeSince || point.at > now + 5000) return null
  if (draft.points.length >= MAX_POINTS) return null
  const previous = draft.points.at(-1)
  if (previous) {
    const seconds = (point.at - previous.at) / 1000
    if (seconds <= 0) return null
    if (seconds > 60 && point.segment === previous.segment) point.segment += 1
    if (point.segment === previous.segment) {
      const distance = distanceMetres(previous, point)
      if (distance < Math.max(4, Math.min(previous.accuracy, point.accuracy) / 4)) return null
      if (distance / seconds > 8) return null
    }
  }
  return point
}

export function routeSegments(points) {
  const segments = []
  for (const point of points) {
    if (!segments.length || segments.at(-1).at(-1).segment !== point.segment) segments.push([])
    segments.at(-1).push(point)
  }
  return segments
}

export function walkDistance(points) {
  return points.reduce((sum, point, index) => {
    const previous = points[index - 1]
    return sum + (previous && previous.segment === point.segment ? distanceMetres(previous, point) : 0)
  }, 0)
}

export function elapsedWalk(draft, now = Date.now()) {
  return draft.elapsedMs + (draft.phase === 'recording' ? Math.max(0, now - draft.activeSince) : 0)
}

export function createWalkDraft(now = Date.now()) {
  return { id: newWalkId(), ownerId: 'me', startedAt: now, endedAt: null, phase: 'recording', activeSince: now, elapsedMs: 0, segment: 0, points: [] }
}

export function stopDraft(draft, phase, now = Date.now()) {
  return { ...draft, phase, elapsedMs: elapsedWalk(draft, now), activeSince: null, endedAt: phase === 'review' ? now : null }
}

export function resumeDraft(draft, now = Date.now()) {
  return { ...draft, phase: 'recording', activeSince: now, endedAt: null, segment: draft.segment + 1 }
}

export function finishWalk(draft, title, visibility, now = Date.now()) {
  if (!['private', 'followers'].includes(visibility)) throw new Error('Choose who can see your walk.')
  if (draft.points.length < 2 || walkDistance(draft.points) < 5) throw new Error('Record a little more of your route before saving a walk.')
  const stopped = draft.phase === 'review' ? draft : stopDraft(draft, 'review', now)
  return {
    id: draft.id, ownerId: 'me', title: title.trim().slice(0, 80) || 'A walk with my dog',
    startedAt: draft.startedAt, endedAt: stopped.endedAt, elapsedMs: stopped.elapsedMs,
    points: draft.points, visibility, sharedChatIds: [],
  }
}

export function canViewWalk(walk, { viewerId = 'me', followingOwnerIds = [], chatId, chatMemberIds = [] } = {}) {
  if (!walk) return false
  if (walk.ownerId === viewerId) return true
  if (walk.visibility === 'followers' && followingOwnerIds.includes(walk.ownerId)) return true
  return Boolean(chatId && walk.sharedChatIds.includes(chatId) && chatMemberIds.includes(viewerId))
}

export function readWalkStore(storage, now = Date.now()) {
  try {
    const raw = (storage ?? localStorage).getItem(WALK_STORAGE_KEY)
    if (!raw) return { walks: [], draft: null, notice: '' }
    const saved = JSON.parse(raw)
    if (!saved || !Array.isArray(saved.walks)) throw new Error('Invalid walk history')
    const walks = saved.walks.filter((walk) => walk && typeof walk.id === 'string' &&
      typeof walk.ownerId === 'string' && typeof walk.title === 'string' &&
      ['private', 'followers'].includes(walk.visibility) && Array.isArray(walk.sharedChatIds) &&
      walk.sharedChatIds.every((id) => typeof id === 'string') &&
      Number.isFinite(walk.startedAt) && Number.isFinite(walk.endedAt) &&
      Number.isFinite(walk.elapsedMs) && walk.elapsedMs >= 0 &&
      Array.isArray(walk.points) && walk.points.length <= MAX_POINTS && walk.points.every(validPoint))
    let draft = saved.draft
    if (draft && (typeof draft.id !== 'string' || !['recording', 'paused', 'review'].includes(draft.phase) ||
      !Number.isFinite(draft.startedAt) || !Number.isFinite(draft.elapsedMs) || draft.elapsedMs < 0 ||
      !Number.isInteger(draft.segment) || draft.segment < 0 ||
      !Array.isArray(draft.points) || draft.points.length > MAX_POINTS || !draft.points.every(validPoint) ||
      (draft.phase === 'recording' && !Number.isFinite(draft.activeSince)) ||
      (draft.phase === 'review' && !Number.isFinite(draft.endedAt)))) draft = null
    if (draft?.phase === 'recording') {
      // Only count time up to the last saved fix; never count time while closed.
      draft = stopDraft(draft, 'paused', Math.min(now, draft.points.at(-1)?.at ?? draft.activeSince))
    }
    return { walks, draft: draft ?? null, notice: '' }
  } catch {
    return { walks: [], draft: null, notice: 'Saved walks could not be read. Nothing has been overwritten. Free up device storage or try again before recording.' }
  }
}

export function writeWalkStore(store, storage) {
  (storage ?? localStorage).setItem(WALK_STORAGE_KEY, JSON.stringify({ walks: store.walks, draft: store.draft }))
}

export function watchWalkPosition(geolocation, onPosition, onError) {
  let active = true
  let id
  try {
    id = geolocation.watchPosition(
      (position) => { if (active) onPosition(position) },
      (error) => { if (active) onError(error) },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    )
  } catch {
    onError({ code: 1 })
    return () => { active = false }
  }
  return () => { active = false; geolocation.clearWatch(id) }
}

export function formatWalkDistance(metres) {
  return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(2)} km`
}

export function formatWalkDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`
}
