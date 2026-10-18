import { useEffect, useState } from 'react'

const STORAGE_KEY = 'tailmates.privacy'

// Privacy belongs to the owner's account, not to a dog. Both choices start OFF,
// so nothing about a person is shared until they switch it on.
export const DEFAULT_PRIVACY = {
  shareLocation: false, // start/stop: share live location with friends during a walk
  suggestToOthers: false, // opt in to appear in other owners' "suggested walkers"
}

function readStored() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    return { ...DEFAULT_PRIVACY, ...saved }
  } catch {
    // Storage can be blocked (private browsing); fall back to the safe defaults.
    return DEFAULT_PRIVACY
  }
}

export default function usePrivacySettings() {
  const [settings, setSettings] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      // Not being able to save should never break the screen.
    }
  }, [settings])

  function setSetting(key, value) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  return { settings, setSetting }
}
