import { normalizeProfile } from './profileData.js'
import { SAMPLE_FRIEND_WALK } from './sampleWalks.js'

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
    preferences: 'Easy afternoon walks, usually around 5pm. Max loves a sniff along the river.',
    favouritePark: 'Captain Burke Park',
    dogAge: '4',
    dogSex: 'male',
    temperamentTags: ['good-with-dogs', 'playful'],
    name: 'Sam',
    dog: 'Beagle',
    dogName: 'Max',
    dogSize: 'medium',
    temperament: ['Friendly', 'Playful'],
    suburb: 'Kangaroo Point',
    tone: 'accent',
  },
  {
    id: 'priya',
    preferences: 'Long early morning walks. We prefer a little space when meeting new dogs.',
    favouritePark: 'Orleigh Park',
    dogAge: '3',
    dogSex: 'female',
    temperamentTags: ['energetic', 'needs-space'],
    name: 'Priya',
    dog: 'Husky',
    dogName: 'Luna',
    dogSize: 'large',
    temperament: ['Energetic', 'Needs space'],
    suburb: 'West End',
    tone: 'water',
  },
  {
    id: 'tom',
    preferences: 'Short weekend walks and gentle introductions with smaller dogs.',
    favouritePark: 'New Farm Park',
    dogAge: '2',
    dogSex: 'male',
    temperamentTags: ['shy-with-new-dogs', 'good-with-puppies'],
    name: 'Tom',
    dog: 'Corgi',
    dogName: 'Biscuit',
    dogSize: 'small',
    temperament: ['Shy', 'Good with puppies'],
    suburb: 'New Farm',
    tone: 'primary',
  },
  {
    id: 'aroha',
    preferences: 'Morning walks with a game of fetch afterwards. Always up for a riverside loop.',
    favouritePark: 'Raymond Park',
    dogAge: '5',
    dogSex: 'female',
    temperamentTags: ['energetic', 'loves-fetch', 'reliable-recall'],
    name: 'Aroha',
    dog: 'Border Collie',
    dogName: 'Pepper',
    dogSize: 'medium',
    temperament: ['Focused', 'Loves fetch'],
    suburb: 'Woolloongabba',
    tone: 'accent',
  },
  {
    id: 'dan',
    preferences: 'Relaxed evening strolls and a stop at the dog park on weekends.',
    favouritePark: 'Bulimba Riverside Park',
    dogAge: '6',
    dogSex: 'female',
    temperamentTags: ['calm', 'good-with-kids'],
    name: 'Dan',
    dog: 'Staffy',
    dogName: 'Olive',
    dogSize: 'medium',
    temperament: ['Calm', 'Great with kids'],
    suburb: 'Bulimba',
    tone: 'water',
  },
  {
    id: 'mei',
    preferences: 'Short, shady walks with plenty of breaks. Happy to meet other slow walkers.',
    favouritePark: 'Musgrave Park',
    dogAge: '4',
    dogSex: 'male',
    temperamentTags: ['slow-walker', 'good-with-dogs'],
    name: 'Mei',
    dog: 'Pug',
    dogName: 'Dumpling',
    dogSize: 'small',
    temperament: ['Slow walker', 'Very social'],
    suburb: 'South Brisbane',
    tone: 'primary',
  },
]

// Incoming follows are independent of the people you choose to follow.
export const followerIds = ['sam', 'priya', 'dan', 'mei']

export const groups = [
  {
    id: 'riverside-walkers',
    lastActivityAt: Date.parse('2026-10-18T18:50:00+10:00'),
    name: 'Riverside Morning Walkers',
    subtitle: '4 members · Daily at 7am',
    memberIds: ['sam', 'priya', 'aroha'],
    messages: [
      { id: 'riverside-1', from: 'sam', type: 'text', text: 'Anyone keen for a river walk tomorrow morning?', time: '6:42 pm' },
      { id: 'riverside-2', from: 'priya', type: 'text', text: 'Luna and I are in! Shall we meet at 7 by the park entrance?', time: '6:45 pm' },
      { id: 'riverside-3', from: 'me', type: 'text', text: 'Sounds good. See you both there!', time: '6:47 pm' },
      { id: 'riverside-4', from: 'aroha', type: 'text', text: 'Count us in too. I will bring a ball for Pepper.', time: '6:50 pm' },
    ],
    time: 'Sun',
    tone: 'primary',
  },
  {
    id: 'golden-club',
    lastActivityAt: Date.parse('2026-10-18T15:20:00+10:00'),
    name: 'Golden Retriever Club',
    subtitle: '4 members · Weekend park visits',
    memberIds: ['sam', 'dan', 'mei'],
    messages: [
      { id: 'golden-1', from: 'dan', type: 'text', text: 'Park catch-up this Sunday? All breeds welcome as usual.', time: '3:10 pm' },
      { id: 'golden-2', from: 'sam', type: 'text', text: 'Max would love that. Late afternoon when it is cooler?', time: '3:14 pm' },
      { id: 'golden-3', from: 'mei', type: 'text', text: 'Perfect for Dumpling. We will bring extra water.', time: '3:20 pm' },
    ],
    time: 'Sun',
    tone: 'accent',
  },
  {
    id: 'puppy-socials',
    lastActivityAt: Date.parse('2026-10-18T09:18:00+10:00'),
    name: 'Puppy Socials',
    subtitle: '4 members · Saturdays',
    memberIds: ['tom', 'aroha', 'dan'],
    messages: [
      { id: 'puppy-1', from: 'tom', type: 'text', text: 'Is the quieter corner free for introductions on Saturday?', time: '9:05 am' },
      { id: 'puppy-2', from: 'dan', type: 'text', text: 'Yes! Olive is happy to help the pups settle in.', time: '9:12 am' },
      { id: 'puppy-3', from: 'aroha', type: 'text', text: 'We will join after a walk so Pepper is a bit calmer.', time: '9:18 am' },
    ],
    time: 'Sun',
    tone: 'water',
  },
]

const seededDirectChats = [
  {
    id: 'chat-sam',
    lastActivityAt: Date.parse('2026-10-18T18:58:00+10:00'),
    ownerId: 'sam',
    name: 'Sam',
    subtitle: 'See you at the park at 5?',
    time: 'Sun',
    tone: 'accent',
  },
  {
    id: 'chat-priya',
    lastActivityAt: Date.parse('2026-10-18T18:00:00+10:00'),
    ownerId: 'priya',
    name: 'Priya',
    subtitle: 'Luna loved the walk today!',
    time: 'Sun',
    tone: 'water',
  },
  {
    id: 'chat-tom',
    lastActivityAt: Date.parse('2026-10-17T12:00:00+10:00'),
    ownerId: 'tom',
    name: 'Tom',
    subtitle: 'Is the dog run open this weekend?',
    time: 'Sat',
    tone: 'primary',
  },
]

// Every owner has one stable conversation, including people you have not messaged yet.
export const directChats = owners.map((person) => {
  const seeded = seededDirectChats.find((chat) => chat.ownerId === person.id)
  const dogNames = getDogNames(person)
  return {
    id: `chat-${person.id}`,
    ownerId: person.id,
    name: person.name,
    dogNames,
    subtitle: seeded?.subtitle ?? 'Start a conversation',
    time: person.id === 'sam' ? 'Wed' : seeded?.time ?? '',
    lastActivityAt: seeded?.lastActivityAt ?? 0,
    tone: person.tone,
    messages: [
      ...(seeded ? [{ id: `hello-${person.id}`, from: person.id, type: 'text', text: seeded.subtitle }] : []),
      ...(person.id === 'sam' ? [
        { id: 'sample-walk-intro', from: 'sam', type: 'text', text: 'Max and I enjoyed this riverside walk. Thought you might like it!', createdAt: SAMPLE_FRIEND_WALK.endedAt + 60000, time: '5:57 pm' },
        { id: 'sample-walk-message', from: 'sam', type: 'walk', walkId: SAMPLE_FRIEND_WALK.id, createdAt: SAMPLE_FRIEND_WALK.endedAt + 120000, time: '5:58 pm' },
      ] : []),
    ],
  }
})

export const groupChats = groups.map((group) => ({ ...group, id: `group-${group.id}`, isGroup: true }))
export const allChats = [...directChats, ...groupChats]
export const chats = [...directChats.filter((chat) => seededDirectChats.some((seed) => seed.id === chat.id)), ...groupChats]

export function getDogNames(person) {
  return (person.dogs?.map((dog) => dog.name) ?? [person.dogName]).filter(Boolean)
}

export function getOwnerProfile(person) {
  return normalizeProfile({
    owner: {
      name: person.name,
      suburb: person.suburb,
      preferences: person.preferences,
      favouritePark: person.favouritePark,
    },
    dogs: person.dogs ?? [{
      id: `dog-${person.id}`,
      name: person.dogName,
      breed: person.dog,
      age: person.dogAge,
      sex: person.dogSex,
      size: person.dogSize,
      temperamentTags: person.temperamentTags,
    }],
    onboardingComplete: true,
  })
}
