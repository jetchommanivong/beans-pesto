import { useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import DogTags from './DogTags.jsx'
import { SIZE_OPTIONS, TAG_OPTIONS } from '../data/dogDetails.js'
import './DogTagEditor.css'

// Shows the dog's size and tags, with an Edit button that swaps them for choices the
// owner can switch on and off. Changes save straight away (see useDogTags).
export default function DogTagEditor({ details, onChange }) {
  const [editing, setEditing] = useState(false)

  function toggleTag(tag) {
    const selected = details.temperamentTags.includes(tag)
    onChange({
      ...details,
      temperamentTags: selected
        ? details.temperamentTags.filter((item) => item !== tag)
        : TAG_OPTIONS.filter((item) => item === tag || details.temperamentTags.includes(item)),
    })
  }

  if (!editing) {
    return (
      <div className="tag-editor">
        <DogTags size={details.size} tags={details.temperamentTags} />
        <button type="button" className="tag-editor__button" onClick={() => setEditing(true)}>
          <Pencil size={14} aria-hidden="true" />
          Edit size and tags
        </button>
      </div>
    )
  }

  return (
    <div className="tag-editor tag-editor--open">
      <p className="tag-editor__label">Size</p>
      <div className="tag-editor__options" role="group" aria-label="Dog size">
        {SIZE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className="tag-editor__option"
            aria-pressed={details.size === option.value}
            onClick={() => onChange({ ...details, size: option.value })}
          >
            {details.size === option.value && <Tick />}
            {option.label}
          </button>
        ))}
      </div>

      <p className="tag-editor__label">Temperament</p>
      <div className="tag-editor__options" role="group" aria-label="Temperament tags">
        {TAG_OPTIONS.map((tag) => (
          <button
            key={tag}
            type="button"
            className="tag-editor__option"
            aria-pressed={details.temperamentTags.includes(tag)}
            onClick={() => toggleTag(tag)}
          >
            {details.temperamentTags.includes(tag) && <Tick />}
            {tag}
          </button>
        ))}
      </div>

      <button type="button" className="tag-editor__button" onClick={() => setEditing(false)}>
        <Check size={14} aria-hidden="true" />
        Done
      </button>
    </div>
  )
}

// A tick for chosen options, hidden from screen readers because aria-pressed already
// says whether the option is on.
function Tick() {
  return (
    <span className="tag-editor__tick" aria-hidden="true">
      ✓{' '}
    </span>
  )
}
