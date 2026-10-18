import { useContext } from 'react'
import { ProfileContext } from '../context/profileContext.js'
export default function useProfile() {
  const value = useContext(ProfileContext)
  if (!value) throw new Error('useProfile must be used inside ProfileProvider')
  return value
}