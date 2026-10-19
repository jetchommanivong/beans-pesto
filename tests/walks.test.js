import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  WALK_STORAGE_KEY, acceptPosition, canViewWalk, createWalkDraft, distanceMetres,
  elapsedWalk, finishWalk, formatWalkDistance, formatWalkDuration, readWalkStore,
  resumeDraft, routeSegments, stopDraft, walkDistance, watchWalkPosition, writeWalkStore,
} from '../src/data/walkData.js'

const start = 1792300000000
const point = (lat, seconds, segment = 0) => ({ lat, lon: 153.02, accuracy: 5, at: start + seconds * 1000, segment })
const position = (lat, seconds, accuracy = 5) => ({ coords: { latitude: lat, longitude: 153.02, accuracy }, timestamp: start + seconds * 1000 })
const route = [point(-27.47, 0), point(-27.4701, 10), point(-27.4702, 20)]
const draft = () => ({ ...createWalkDraft(start), points: route })
function storage(initial) {
  const data = new Map(initial ? [[WALK_STORAGE_KEY, JSON.stringify(initial)]] : [])
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}

test('recording uses fresh precise fixes and rejects poor GPS, stale positions and jitter', () => {
  const active = { ...createWalkDraft(start), points: [] }
  const first = acceptPosition(active, position(-27.47, 0), start)
  assert.ok(first)
  active.points = [first]
  assert.ok(acceptPosition(active, position(-27.4701, 10), start + 10000))
  assert.equal(acceptPosition(active, position(-27.4702, 20, 100), start + 20000), null)
  assert.equal(acceptPosition(active, position(-27.47, 10), start + 10000), null)
  assert.equal(acceptPosition(active, position(-27.470001, 10), start + 10000), null)
  assert.equal(acceptPosition(active, position(-27.4701, -1), start + 10000), null)
  assert.equal(acceptPosition(active, position(-27.4701, 30), start + 10000), null)
  assert.equal(acceptPosition(active, position(100, 10), start + 10000), null)
})

test('GPS jumps are ignored and GPS gaps split the displayed route and distance', () => {
  const active = { ...createWalkDraft(start), points: [route[0]] }
  assert.equal(acceptPosition(active, position(-28, 10), start + 10000), null)
  const afterGap = acceptPosition(active, position(-28, 120), start + 120000)
  assert.equal(afterGap.segment, 1)
  assert.equal(walkDistance([route[0], afterGap]), 0)
  assert.equal(routeSegments([route[0], afterGap]).length, 2)
})

test('pausing excludes time and resuming does not draw across the pause', () => {
  const paused = stopDraft(draft(), 'paused', start + 30000)
  assert.equal(elapsedWalk(paused, start + 120000), 30000)
  const resumed = resumeDraft(paused, start + 120000)
  assert.equal(elapsedWalk(resumed, start + 130000), 40000)
  assert.equal(resumed.segment, 1)
  const next = acceptPosition(resumed, position(-27.48, 121), start + 121000)
  assert.ok(next)
  assert.equal(walkDistance([...route, next]), walkDistance(route))
  const finished = stopDraft(resumed, 'review', start + 140000)
  assert.equal(finished.elapsedMs, 50000)
  assert.equal(finished.endedAt, start + 140000)
})

test('saving a walk requires a real route and an explicit privacy choice', () => {
  assert.throws(() => finishWalk({ ...draft(), points: [] }, 'Empty', 'private'), /Record a little more/)
  assert.throws(() => finishWalk(draft(), 'Walk', 'public'), /Choose who/)
  const walk = finishWalk(stopDraft(draft(), 'review', start + 30000), '  Morning walk  ', 'private')
  assert.equal(walk.title, 'Morning walk')
  assert.equal(walk.visibility, 'private')
  assert.deepEqual(walk.sharedChatIds, [])
  assert.equal(walk.elapsedMs, 30000)
})

test('walk storage recovers an unfinished recording paused without recording closed-app time', () => {
  const saved = storage({ walks: [], draft: draft() })
  const restored = readWalkStore(saved, start + 3600000)
  assert.equal(restored.draft.phase, 'paused')
  assert.equal(restored.draft.elapsedMs, 20000)
  assert.deepEqual(restored.draft.points, route)
  const finished = finishWalk(stopDraft(draft(), 'review', start + 30000), 'Route', 'followers')
  writeWalkStore({ walks: [finished], draft: null }, saved)
  assert.deepEqual(readWalkStore(saved).walks, [finished])
})

test('corrupt storage is preserved and unavailable storage reports failure rather than claiming a save', () => {
  const invalid = storage()
  invalid.setItem(WALK_STORAGE_KEY, '{broken')
  const restored = readWalkStore(invalid)
  assert.ok(restored.notice)
  assert.equal(invalid.getItem(WALK_STORAGE_KEY), '{broken')
  const blocked = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('full') } }
  assert.ok(readWalkStore(blocked).notice)
  assert.throws(() => writeWalkStore({ walks: [], draft: null }, blocked), /full/)
})

test('private walks are owner-only until explicitly shared to a conversation', () => {
  const walk = finishWalk(draft(), 'Private route', 'private', start + 30000)
  assert.equal(canViewWalk(walk), true)
  assert.equal(canViewWalk(walk, { viewerId: 'sam', followingOwnerIds: ['me'] }), false)
  const shared = { ...walk, sharedChatIds: ['group-riverside-walkers'] }
  assert.equal(canViewWalk(shared, { viewerId: 'sam', chatId: 'group-riverside-walkers', chatMemberIds: ['me', 'sam'] }), true)
  assert.equal(canViewWalk(shared, { viewerId: 'mei', chatId: 'group-riverside-walkers', chatMemberIds: ['me', 'sam'] }), false)
  assert.equal(canViewWalk(shared, { viewerId: 'sam', chatId: 'chat-tom', chatMemberIds: ['me', 'sam'] }), false)
  assert.equal(canViewWalk(null), false)
})

test('follower visibility requires following the owner and can be revoked', () => {
  const walk = { ...finishWalk(draft(), 'Route', 'followers', start + 30000), ownerId: 'priya' }
  assert.equal(canViewWalk(walk, { followingOwnerIds: ['priya'] }), true)
  assert.equal(canViewWalk(walk, { followingOwnerIds: [] }), false)
  assert.equal(canViewWalk({ ...walk, visibility: 'private' }, { followingOwnerIds: ['priya'] }), false)
})

test('watch requests high accuracy and cleanup prevents late updates after finishing', () => {
  let success, error, cleared
  const geo = { watchPosition(onSuccess, onError, options) {
    success = onSuccess; error = onError
    assert.deepEqual(options, { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 })
    return 42
  }, clearWatch(id) { cleared = id } }
  const received = [], errors = []
  const stop = watchWalkPosition(geo, (fix) => received.push(fix), (failure) => errors.push(failure))
  success(position(-27.47, 0))
  error({ code: 3 })
  stop()
  success(position(-27.48, 10))
  error({ code: 1 })
  assert.equal(cleared, 42)
  assert.equal(received.length, 1)
  assert.equal(errors.length, 1)
  let denied
  assert.doesNotThrow(() => watchWalkPosition({ watchPosition() { throw new Error('denied') } }, () => {}, (failure) => { denied = failure.code }))
  assert.equal(denied, 1)
})

test('distance and duration metrics have useful walking units', () => {
  assert.ok(Math.abs(distanceMetres(route[0], route[1]) - 11.12) < .1)
  assert.ok(walkDistance(route) > 22 && walkDistance(route) < 23)
  assert.equal(formatWalkDistance(1250), '1.25 km')
  assert.equal(formatWalkDistance(22.2), '22 m')
  assert.equal(formatWalkDuration(125000), '2m 05s')
  assert.equal(formatWalkDuration(3660000), '1h 1m')
})
