import { useEffect, useRef, useState } from 'react'
import { WalkContext } from '../context/walkContext.js'
import { allChats } from '../data/mockData.js'
import { loadMessages, saveMessages } from '../data/chatMessages.js'
import {
  acceptPosition, createWalkDraft, finishWalk, newWalkId, readWalkStore,
  MAX_GPS_ACCURACY, resumeDraft, stopDraft, watchWalkPosition, writeWalkStore,
} from '../data/walkData.js'

export default function WalkProvider({ children, onOpenChat }) {
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
    if (store.draft?.phase !== 'recording') return
    const geolocation = navigator.geolocation
    if (!geolocation) return
    return watchWalkPosition(geolocation, (position) => {
      const state = current.current
      if (state.draft?.phase !== 'recording') return
      const accuracy = position.coords.accuracy
      setGps({
        status: accuracy > MAX_GPS_ACCURACY ? 'weak' : 'tracking', accuracy,
        message: accuracy > MAX_GPS_ACCURACY ? 'GPS is too approximate. Waiting for a clearer signal before adding to your route.' : '',
      })
      const point = acceptPosition(state.draft, position)
      if (point) commit({ ...state, draft: { ...state.draft, segment: point.segment, points: [...state.draft.points, point] } }, false)
    }, (error) => {
      const state = current.current
      if (state.draft?.phase !== 'recording') return
      setGps({ status: 'error', accuracy: null, message: error.code === 1
        ? 'Location access was denied. Allow location in your browser, then resume your walk.'
        : 'GPS signal lost. The recorder is waiting for your location; missing sections will not be joined together.' })
      if (error.code === 1) commit({ ...state, draft: stopDraft(state.draft, 'paused') }, false)
    })
    // Recording is controlled only by the draft phase, not every arriving fix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.draft?.id, store.draft?.phase])

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
      commit({ ...state, draft: stopDraft(state.draft, 'paused') }, false)
      setGps({ status: 'idle', accuracy: null, message: 'Your walk paused while the app was in the background. Resume when you are ready.' })
    }
    document.addEventListener('visibilitychange', handleHidden)
    return () => document.removeEventListener('visibilitychange', handleHidden)
    // The listener reads the latest draft through current.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function start() {
    if (current.current.draft) return true
    if (current.current.notice) {
      const restored = readWalkStore()
      if (restored.notice) { setNotice(restored.notice); return false }
      current.current = restored
      setStore(restored)
      if (restored.draft) return true
    }
    if (!globalThis.isSecureContext || !navigator.geolocation) {
      setNotice('Walk recording needs location access on HTTPS or localhost. Open the app securely and try again.')
      return false
    }
    setGps({ status: 'waiting', accuracy: null, message: 'Finding your location…' })
    return commit({ ...current.current, draft: createWalkDraft() })
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
    if (!globalThis.isSecureContext || !navigator.geolocation) {
      setNotice('Location is unavailable. Use HTTPS or localhost and allow location access before resuming.')
      return
    }
    setGps({ status: 'waiting', accuracy: null, message: 'Finding your location…' })
    commit({ ...state, draft: resumeDraft(state.draft) }, false)
  }

  function finish() {
    const state = current.current
    if (state.draft) commit({ ...state, draft: stopDraft(state.draft, 'review') }, false)
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

  function revokeShares(id) {
    return commit({ ...current.current, walks: current.current.walks.map((walk) => walk.id === id && walk.ownerId === 'me' ? { ...walk, sharedChatIds: [] } : walk) })
  }

  function shareWalk(id, chatId) {
    const state = current.current
    const walk = state.walks.find((item) => item.id === id && item.ownerId === 'me')
    if (!walk || !allChats.some((chat) => chat.id === chatId)) return false
    const shared = { ...walk, sharedChatIds: [...new Set([...walk.sharedChatIds, chatId])] }
    const messages = loadMessages(chatId)
    const message = {
      id: newWalkId(), from: 'me', type: 'walk', walkId: id, createdAt: Date.now(),
      sentAt: new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }),
    }
    const next = { ...state, walks: state.walks.map((item) => item.id === id ? shared : item) }
    try {
      writeWalkStore(next)
      if (!saveMessages(chatId, [...messages, message])) {
        writeWalkStore(state)
        throw new Error('Could not save the chat')
      }
      current.current = next
      setStore(next)
      setNotice('')
      onOpenChat(chatId)
      return true
    } catch {
      setNotice('The route could not be shared. Free up device storage and try again.')
      return false
    }
  }

  return <WalkContext.Provider value={{
    ...store, notice, gps, screenAwake, start, pause, resume, finish, save, discard,
    deleteWalk, changeVisibility, revokeShares, shareWalk,
  }}>{children}</WalkContext.Provider>
}
