import { useEffect, useRef, useState } from 'react'
import { WalkContext } from '../context/walkContext.js'
import usePrivacySettings from '../hooks/usePrivacySettings.js'
import {
  acceptPosition, createWalkDraft, finishWalk, readWalkStore,
  resumeDraft, stopDraft, watchWalkPosition, writeWalkStore,
} from '../data/walkData.js'

export default function WalkProvider({ children }) {
  const { settings } = usePrivacySettings()
  const [liveSharing, setLiveSharingState] = useState(false)
  const [initial] = useState(readWalkStore)
  const [store, setStore] = useState(initial)
  const current = useRef(initial)
  const [notice, setNotice] = useState(initial.notice)
  const [gps, setGps] = useState({ status: 'idle', accuracy: null, message: '' })
  const [screenAwake, setScreenAwake] = useState(false)

  function commit(next, required = true) {
    try {
      writeWalkStore(next)
      setNotice('')
    } catch {
      setNotice('This browser could not save your walk. Keep this page open, free up some device storage, and try again. Your route is still available here.')
      if (required) return false
    }
    current.current = next
    setStore(next)
    return true
  }

  // The provider stays mounted across navigation. Reloaded drafts need an
  // explicit Resume; GPS is never started just by opening the app.
  useEffect(() => {
    if (store.draft?.phase !== 'recording' || !store.draft.recordRoute) return
    const geolocation = navigator.geolocation
    if (!geolocation) return
    return watchWalkPosition(geolocation, (position) => {
      const state = current.current
      if (state.draft?.phase !== 'recording' || !state.draft.recordRoute) return
      const accuracy = position.coords.accuracy
      setGps({
        status: 'tracking', accuracy, message: '',
      })
      const point = acceptPosition(state.draft, position)
      if (point) commit({ ...state, draft: { ...state.draft, segment: point.segment, points: [...state.draft.points, point] } }, false)
    }, (error) => {
      const state = current.current
      if (state.draft?.phase !== 'recording' || !state.draft.recordRoute) return
      setGps({ status: 'error', accuracy: null, message: error.code === 1
        ? 'Location access is blocked. Allow it in your browser, then resume.'
        : error.code === 3 ? 'Location timed out. Route recording is waiting for GPS.' : 'Location is unavailable. Route recording is waiting for GPS.' })
      if (error.code === 1) commit({ ...state, draft: { ...stopDraft(state.draft, 'paused'), pauseReason: 'location-denied' } }, false)
    })
    // Recording is controlled only by the draft phase, not every arriving fix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.draft?.id, store.draft?.phase, store.draft?.recordRoute])

  useEffect(() => {
    // Revoking permission also clears the session's live-sharing choice.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!settings.shareLocation) setLiveSharingState(false)
  }, [settings.shareLocation])

  useEffect(() => {
    if (store.draft?.phase !== 'recording' || !navigator.wakeLock) return
    let cancelled = false
    let lock
    const released = () => setScreenAwake(false)
    navigator.wakeLock.request('screen').then((sentinel) => {
      if (cancelled) { sentinel.release().catch(() => {}); return }
      lock = sentinel
      setScreenAwake(true)
      lock.addEventListener('release', released)
    }).catch(() => {})
    return () => {
      cancelled = true
      if (lock) {
        lock.removeEventListener('release', released)
        lock.release().catch(() => {})
      }
      setScreenAwake(false)
    }
  }, [store.draft?.phase])

  useEffect(() => {
    const handleHidden = () => {
      const state = current.current
      if (document.visibilityState !== 'hidden' || state.draft?.phase !== 'recording') return
      commit({ ...state, draft: { ...stopDraft(state.draft, 'paused'), pauseReason: 'background' } }, false)
      setGps({ status: 'idle', accuracy: null, message: 'Walk paused while the app was in the background.' })
    }
    document.addEventListener('visibilitychange', handleHidden)
    return () => document.removeEventListener('visibilitychange', handleHidden)
    // The listener reads the latest draft through current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function start({ recordRoute = false } = {}) {
    if (current.current.draft) return true
    if (current.current.notice) {
      const restored = readWalkStore()
      if (restored.notice) { setNotice(restored.notice); return false }
      current.current = restored
      setStore(restored)
      if (restored.draft) return true
    }
    if (recordRoute && (!globalThis.isSecureContext || !navigator.geolocation)) {
      setNotice('Walk recording needs location access on HTTPS or localhost. Open the app securely and try again.')
      return false
    }
    setGps({ status: recordRoute ? 'waiting' : 'idle', accuracy: null, message: '' })
    return commit({ ...current.current, draft: createWalkDraft(Date.now(), { recordRoute }) })
  }

  function pause() {
    const state = current.current
    if (state.draft?.phase === 'recording') {
      commit({ ...state, draft: stopDraft(state.draft, 'paused') }, false)
      setGps({ status: 'idle', accuracy: null, message: '' })
    }
  }

  function resume() {
    const state = current.current
    if (!state.draft || state.draft.phase === 'recording') return
    if (state.draft.recordRoute && (!globalThis.isSecureContext || !navigator.geolocation)) {
      setNotice('Location is unavailable. Use HTTPS or localhost and allow location access before resuming.')
      return
    }
    setGps({ status: state.draft.recordRoute ? 'waiting' : 'idle', accuracy: null, message: '' })
    commit({ ...state, draft: resumeDraft(state.draft) }, false)
  }

  function finish() {
    const state = current.current
    if (state.draft) commit({ ...state, draft: state.draft.recordRoute || state.draft.points.length ? stopDraft(state.draft, 'review') : null }, false)
  }

  function setLiveSharing(value) {
    setLiveSharingState(Boolean(value && settings.shareLocation))
  }

  function setRecording(value) {
    const state = current.current
    if (!state.draft || state.draft.phase === 'review') return
    if (value && (!globalThis.isSecureContext || !navigator.geolocation)) {
      setNotice('Allow browser location access to record your route.')
      return
    }
    setGps({ status: value ? 'waiting' : 'idle', accuracy: null, message: '' })
    commit({ ...state, draft: { ...state.draft, recordRoute: value, segment: state.draft.segment + 1,
      pauseReason: !value && state.draft.pauseReason === 'location-denied' ? 'manual' : state.draft.pauseReason,
    } }, false)
  }

  function save(title, visibility) {
    try {
      const state = current.current
      const walk = finishWalk(state.draft, title, visibility)
      return commit({ ...state, walks: [walk, ...state.walks], draft: null }) ? walk : null
    } catch (error) { setNotice(error.message); return null }
  }

  function discard() {
    pause()
    return commit({ ...current.current, draft: null })
  }

  function deleteWalk(id) {
    return commit({ ...current.current, walks: current.current.walks.filter((walk) => walk.id !== id || walk.ownerId !== 'me') })
  }

  function changeVisibility(id, visibility) {
    if (!['private', 'followers'].includes(visibility)) return false
    return commit({ ...current.current, walks: current.current.walks.map((walk) => walk.id === id && walk.ownerId === 'me' ? { ...walk, visibility } : walk) })
  }

  return <WalkContext.Provider value={{
    ...store, notice, gps, screenAwake, start, pause, resume, finish, save, discard, setLiveSharing, setRecording,
    sharingActive: Boolean(settings.shareLocation && liveSharing),
    deleteWalk, changeVisibility,
  }}>{children}</WalkContext.Provider>
}
