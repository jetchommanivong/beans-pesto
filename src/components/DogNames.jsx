import { PawPrint } from 'lucide-react'
import './DogNames.css'

export default function DogNames({ names = [] }) {
  const label = names.filter(Boolean).join(', ')
  if (!label) return null
  return <span className="dog-names" title={label}>
    <PawPrint size={12} aria-hidden="true" />
    <span className="dog-names__text">{label}</span>
  </span>
}
