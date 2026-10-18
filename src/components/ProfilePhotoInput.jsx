import { useEffect, useId, useRef, useState } from 'react'
import Avatar from './Avatar.jsx'
import { prepareProfilePhoto } from '../data/profilePhoto.js'

export default function ProfilePhotoInput({ label, name, photo, tone = 'primary', size = 96, onChange }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const request = useRef(0)
  const helpId = useId()

  useEffect(() => () => { request.current += 1 }, [])

  async function selectPhoto(event) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return
    const current = ++request.current
    input.value = ''
    input.setCustomValidity('Please wait for your photo to finish loading.')
    setBusy(true)
    setError('')
    try {
      const result = await prepareProfilePhoto(file)
      if (current === request.current) onChange(result)
    } catch (problem) {
      if (current === request.current) setError(problem.message || 'This photo could not be opened. Please try another photo.')
    } finally {
      if (current === request.current) {
        input.setCustomValidity('')
        setBusy(false)
      }
    }
  }

  return (
    <div className="profile-photo-input" aria-busy={busy}>
      <Avatar name={name || 'Photo'} photo={photo} tone={tone} size={size} />
      <div className="profile-photo-input__controls">
        <label>{label}<input type="file" accept="image/jpeg,image/png,image/webp" aria-describedby={helpId} onChange={selectPhoto} /></label>
        <p id={helpId} className="profile-help">JPG, PNG or WebP, up to 10 MB. Photos are cropped to a square.</p>
        {busy && <p className="profile-help" role="status">Preparing photo…</p>}
        {error && <p className="profile-error" role="alert">{error}</p>}
        {photo && <button type="button" className="button button--secondary button--small" disabled={busy} onClick={() => onChange('')}>Remove photo</button>}
      </div>
    </div>
  )
}
