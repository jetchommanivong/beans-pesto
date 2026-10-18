// Shared content and validation for the profile editor and onboarding.
export const PROFILE_STORAGE_KEY = 'tailmates.profile.v1'
import { TEMPERAMENT_TAGS } from './dogDetails.js'
export { TEMPERAMENT_TAGS }
export const TAG_LABELS = Object.fromEntries(TEMPERAMENT_TAGS.map(tag => [tag.id, tag.label]))
export function newDogId() {
  return globalThis.crypto?.randomUUID?.() ?? `dog-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
export const createDog = () => ({ id: newDogId(), name: '', breed: '', size: '', temperamentTags: [] })
export const createProfile = () => ({ owner: { name: '', suburb: '', preferences: '', favouritePark: '' }, dogs: [createDog()], onboardingComplete: false })
const text = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export function normalizeProfile(value) {
  if (!value || typeof value !== 'object' || !value.owner || !Array.isArray(value.dogs)) throw new Error('Invalid profile')
  const ids = new Set()
  const dogs = value.dogs.filter(dog => dog && typeof dog === 'object').map(dog => {
    let id = text(dog.id, 100)
    if (!id || ids.has(id)) id = newDogId()
    ids.add(id)
    // Accept labels from the earlier prototype, then store stable tag IDs.
    const tags = [...new Set((Array.isArray(dog.temperamentTags) ? dog.temperamentTags : Array.isArray(dog.tags) ? dog.tags : []).map(tag => TAG_LABELS[tag] ? tag : TEMPERAMENT_TAGS.find(item => item.label === tag)?.id).filter(Boolean))]
    return { id, name: text(dog.name, 60), breed: text(dog.breed, 80), size: ['small', 'medium', 'large'].includes(dog.size) ? dog.size : '', temperamentTags: tags }
  })
  return {
    owner: { name: text(value.owner.name, 60), suburb: text(value.owner.suburb, 80), preferences: text(value.owner.preferences, 160), favouritePark: text(value.owner.favouritePark, 100) },
    dogs: dogs.length ? dogs : [createDog()],
    onboardingComplete: value.onboardingComplete === true,
  }
}
export function profileError(profile, section = 'all') {
  if (section !== 'dogs' && !profile.owner.name.trim()) return 'Enter your display name.'
  if (section !== 'owner' && profile.dogs.some(dog => !dog.name.trim())) return 'Enter a name for each dog, or remove the extra entry.'
  return ''
}
export function loadProfile(storage) {
  try {
    const raw = storage.getItem(PROFILE_STORAGE_KEY)
    return { profile: raw ? normalizeProfile(JSON.parse(raw)) : createProfile(), warning: '' }
  } catch {
    return { profile: createProfile(), warning: 'Saved profile data could not be read. Your previous saved data has not been overwritten. You can enter your details again.' }
  }
}