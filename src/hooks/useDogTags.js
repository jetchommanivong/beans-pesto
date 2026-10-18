import { useEffect, useState } from 'react'
import { SIZE_OPTIONS, TAG_OPTIONS, dogDetails } from '../data/dogDetails.js'

const STORAGE_KEY = 'tailmates.dogTags'

// Reads the owner's saved size and tags, ignoring anything that is not one of the
// fixed choices, and falls back to the sample dog if nothing valid is saved.
function readStored() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (!saved) return dogDetails
    const size = SIZE_OPTIONS.some((option) => option.value === saved.size)
      ? saved.size
      : dogDetails.size
    const tags = Array.isArray(saved.temperamentTags)
      ? TAG_OPTIONS.filter((tag) => saved.temperamentTags.includes(tag))
      : dogDetails.temperamentTags
    return { size, temperamentTags: tags }
  } catch {
    // Storage can be blocked (private browsing); show the sample details instead.
    return dogDetails
  }
}

export default function useDogTags() {
  const [details, setDetails] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(details))
    } catch {
      // Not being able to save should never break the screen.
    }
  }, [details])

  return { details, setDetails }
}
