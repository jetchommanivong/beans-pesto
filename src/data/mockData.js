// Placeholder data for the prototype.

export const dogProfile = {
  name: 'Bailey',
  breed: 'Golden Retriever',
  temperament: 'Friendly & playful',
  favouritePark: 'Riverside Park',
  walkPreferences: 'Mornings, around 45 min',
  privacy: 'Only friends see your walks',
}

// Dogs out walking nearby. Still placeholder data — the offsets place them
// a few streets from wherever the user is. Parks and water taps come from the
// council instead, see src/data/brisbaneOpenData.js.
export const nearbyDogs = [
  {
    id: 'dog-max',
    name: 'Max the Beagle',
    detail: 'Out walking now',
    latOffset: 0.0035,
    lonOffset: 0.0028,
  },
  {
    id: 'dog-luna',
    name: 'Luna the Husky',
    detail: 'Looking for a walking buddy',
    latOffset: -0.0042,
    lonOffset: -0.0031,
  },
  {
    id: 'dog-biscuit',
    name: 'Biscuit the Corgi',
    detail: 'At the dog park',
    latOffset: 0.0018,
    lonOffset: -0.0045,
  },
]

// Sample owners. These are the people shown as checked in at a dog park and as
// suggestions on Social, so the one list stays the single source of truth.
// Everything here is invented; only the parks they appear at are real.
export const owners = [
  {
    id: 'sam',
    name: 'Sam & Max',
    dog: 'Beagle',
    dogName: 'Max',
    dogSize: 'medium',
    temperament: ['Friendly', 'Playful'],
    suburb: 'Kangaroo Point',
    tone: 'accent',
  },
  {
    id: 'priya',
    name: 'Priya & Luna',
    dog: 'Husky',
    dogName: 'Luna',
    dogSize: 'large',
    temperament: ['Energetic', 'Needs space'],
    suburb: 'West End',
    tone: 'water',
  },
  {
    id: 'tom',
    name: 'Tom & Biscuit',
    dog: 'Corgi',
    dogName: 'Biscuit',
    dogSize: 'small',
    temperament: ['Shy', 'Good with puppies'],
    suburb: 'New Farm',
    tone: 'primary',
  },
  {
    id: 'aroha',
    name: 'Aroha & Pepper',
    dog: 'Border Collie',
    dogName: 'Pepper',
    dogSize: 'medium',
    temperament: ['Focused', 'Loves fetch'],
    suburb: 'Woolloongabba',
    tone: 'accent',
  },
  {
    id: 'dan',
    name: 'Dan & Olive',
    dog: 'Staffy',
    dogName: 'Olive',
    dogSize: 'medium',
    temperament: ['Calm', 'Great with kids'],
    suburb: 'Bulimba',
    tone: 'water',
  },
  {
    id: 'mei',
    name: 'Mei & Dumpling',
    dog: 'Pug',
    dogName: 'Dumpling',
    dogSize: 'small',
    temperament: ['Slow walker', 'Very social'],
    suburb: 'South Brisbane',
    tone: 'primary',
  },
]

export const groups = [
  {
    id: 'riverside-walkers',
    name: 'Riverside Morning Walkers',
    subtitle: '24 members · Daily at 7am',
    tone: 'primary',
  },
  {
    id: 'golden-club',
    name: 'Golden Retriever Club',
    subtitle: '112 members',
    tone: 'accent',
  },
  {
    id: 'puppy-socials',
    name: 'Puppy Socials',
    subtitle: '38 members · Saturdays',
    tone: 'water',
  },
]

export const chats = [
  {
    id: 'chat-sam',
    name: 'Sam & Max',
    subtitle: 'See you at the park at 5?',
    time: '2m',
    tone: 'accent',
  },
  {
    id: 'chat-priya',
    name: 'Priya & Luna',
    subtitle: 'Luna loved the walk today!',
    time: '1h',
    tone: 'water',
  },
  {
    id: 'chat-tom',
    name: 'Tom & Biscuit',
    subtitle: 'Is the dog run open this weekend?',
    time: 'Mon',
    tone: 'primary',
  },
]
