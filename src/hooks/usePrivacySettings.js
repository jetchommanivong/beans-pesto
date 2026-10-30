import { useEffect, useState } from 'react'

const STORAGE_KEY = 'tailmates.privacy'

// Privacy belongs to the owner's account, not to a dog. Both choices start off.
export const DEFAULT_PRIVACY = {
  shareLocation: false, // mock preference; shows a reminder on Home without broadcasting GPS
  suggestToOthers: false, // opt in to appear in other owners' "suggested walkers"
}

function readStored() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return { shareLocation: saved?.shareLocation === true, suggestToOthers: saved?.suggestToOthers === true }
  } catch {
    // Storage can be blocked (private browsing); fall back to the safe defaults.
    return DEFAULT_PRIVACY
  }
}

export default function usePrivacySettings() {
  const [settings, setSettings] = useState(readStored)

  useEffect(() => {
    const refresh = (event) => setSettings(event.detail ?? readStored())
    window.addEventListener('tailmates:privacy', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('tailmates:privacy', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  function setSetting(key, value) {
    if (!(key in DEFAULT_PRIVACY)) return
    const next = { ...readStored(), [key]: value }
    setSettings(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Not being able to save should never break the screen.
    }
    window.dispatchEvent(new CustomEvent('tailmates:privacy', { detail: next }))
  }

  return { settings, setSetting }
}
