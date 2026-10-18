// Extra details for the signed-in owner's dog, kept apart from the shared sample
// data so adding it can't clash with other edits. Size matches the three bands the
// council data uses for dog parks (small, medium, large).
export const dogDetails = {
  size: 'large',
  temperamentTags: ['Friendly', 'Playful', 'Good with other dogs', 'Loves fetch'],
}

// The choices an owner can pick from when editing. Fixed phrases rather than free
// text, so any two owners can compare dogs at a glance.
export const SIZE_OPTIONS = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

export const TAG_OPTIONS = [
  'Friendly',
  'Playful',
  'Calm',
  'Energetic',
  'Good with other dogs',
  'Good with kids',
  'Loves fetch',
  'Shy at first',
  'Needs space',
]
