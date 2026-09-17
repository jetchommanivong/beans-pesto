// Placeholder data for the prototype. Replace with real API calls later.

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

export const peopleToFollow = [
  { id: 'sam', name: 'Sam & Max', dog: 'Beagle', tone: 'accent' },
  { id: 'priya', name: 'Priya & Luna', dog: 'Husky', tone: 'water' },
  { id: 'tom', name: 'Tom & Biscuit', dog: 'Corgi', tone: 'primary' },
  { id: 'aroha', name: 'Aroha & Pepper', dog: 'Border Collie', tone: 'accent' },
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
