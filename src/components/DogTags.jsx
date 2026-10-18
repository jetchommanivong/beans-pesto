import './DogTags.css'

const SIZE_LABELS = { small: 'Small dog', medium: 'Medium dog', large: 'Large dog' }

// A dog's size plus short temperament tags (e.g. "Friendly", "Needs space").
// Tags are fixed phrases, not free text, so two owners can compare dogs at a glance
// instead of guessing from breed alone.
export default function DogTags({ size, tags = [] }) {
  return (
    <ul className="dog-tags" aria-label="Dog size and temperament">
      {size && (
        <li className="dog-tags__chip dog-tags__chip--size">{SIZE_LABELS[size] ?? size}</li>
      )}
      {tags.map((tag) => (
        <li key={tag} className="dog-tags__chip">
          {tag}
        </li>
      ))}
    </ul>
  )
}
