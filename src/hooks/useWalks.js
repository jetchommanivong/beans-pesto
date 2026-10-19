import { useContext } from 'react'
import { WalkContext } from '../context/walkContext.js'

export default function useWalks() {
  const value = useContext(WalkContext)
  if (!value) throw new Error('useWalks must be used inside WalkProvider')
  return value
}
