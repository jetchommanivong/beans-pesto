import { useEffect, useState } from 'react'
import { ProfileContext } from '../context/profileContext.js'
import { loadProfile, normalizeProfile, profileError, PROFILE_STORAGE_KEY } from '../data/profileData.js'

export default function ProfileProvider({ children }) {
  const [initial] = useState(() => loadProfile({ getItem: key => localStorage.getItem(key) }))
  const [saved, setSaved] = useState(initial.profile)
  const [draft, setDraft] = useState(initial.profile)
  const [notice, setNotice] = useState(initial.warning)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  // The provider remains mounted when navigating between pages, preserving drafts.
  useEffect(() => {
    if (!dirty) return
    const warn = event => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function saveProfile(complete = false) {
    try {
      const next = normalizeProfile({ ...draft, onboardingComplete: complete || draft.onboardingComplete })
      const error = profileError(next)
      if (error) return { ok: false, message: error }
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(next))
      setSaved(next); setDraft(next); setNotice('')
      return { ok: true, message: 'Profile saved.' }
    } catch {
      return { ok: false, message: 'This browser could not save your profile. Your entries remain available while this app stays open. Please try again.' }
    }
  }
  return <ProfileContext.Provider value={{ saved, draft, setDraft, dirty, notice, saveProfile, discard: () => setDraft(saved) }}>{children}</ProfileContext.Provider>
}
