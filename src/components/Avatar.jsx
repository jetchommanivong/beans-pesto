import './Avatar.css'

// "Sam Taylor" -> "ST"
function getInitials(name) {
  const words = name.split(/\s+/).filter((word) => /\w/.test(word))
  const first = words[0]?.[0] ?? ''
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export default function Avatar({ name, photo, tone = 'primary', size = 48 }) {
  return (
    <span
      className={`avatar tone-${tone}`}
      style={{ '--avatar-size': `${size}px` }}
      aria-hidden="true"
    >
      {photo ? <img src={photo} alt="" /> : getInitials(name)}
    </span>
  )
}
