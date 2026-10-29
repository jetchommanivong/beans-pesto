// Small, fixed routes for trying the prototype without recording a real walk.
function sampleWalk(id, ownerId, title, startedAt, minutes, coordinates, sharedChatIds = []) {
  const start = Date.parse(startedAt)
  const elapsedMs = minutes * 60000
  return {
    id, ownerId, title, startedAt: start, endedAt: start + elapsedMs, elapsedMs,
    visibility: 'private', sharedChatIds,
    points: coordinates.map(([lat, lon], index) => ({
      lat, lon, at: start + Math.round(elapsedMs * index / (coordinates.length - 1)), accuracy: 8, segment: 0,
    })),
  }
}

export const SAMPLE_USER_WALK = sampleWalk(
  'sample-walk-me', 'me', 'Morning river loop', '2026-10-28T07:00:00+10:00', 22,
  [
    [-27.4698, 153.0345], [-27.4688, 153.0344], [-27.4677, 153.0343],
    [-27.4665, 153.0341], [-27.4652, 153.0339], [-27.4639, 153.0337],
    [-27.4626, 153.0336], [-27.4618, 153.0341], [-27.4622, 153.0348],
    [-27.4636, 153.0350], [-27.4651, 153.0349], [-27.4666, 153.0349],
    [-27.4682, 153.0349], [-27.4698, 153.0345],
  ],
)

export const SAMPLE_FRIEND_WALK = sampleWalk(
  'sample-walk-sam', 'sam', 'An afternoon with Max', '2026-10-28T17:30:00+10:00', 26,
  [
    [-27.4694, 153.0492], [-27.4685, 153.0484], [-27.4676, 153.0475],
    [-27.4668, 153.0463], [-27.4661, 153.0449], [-27.4654, 153.0435],
    [-27.4647, 153.0422], [-27.4640, 153.0410], [-27.4635, 153.0398],
    [-27.4638, 153.0384], [-27.4642, 153.0372], [-27.4647, 153.0363],
  ],
  ['chat-sam'],
)

export const SAMPLE_WALKS = [SAMPLE_USER_WALK, SAMPLE_FRIEND_WALK]
