import { useState } from 'react'
import { Link, useHref, useParams } from 'react-router'
import { CalendarClock, Check, Copy, MapPin, Send } from 'lucide-react'
import useNearbyPlaces from '../hooks/useNearbyPlaces.js'
import useUserLocation from '../hooks/useUserLocation.js'
import { formatDistance } from '../data/brisbaneOpenData.js'
import { chats } from '../data/mockData.js'
import './ChatPage.css'

const SEARCH_RADIUS_KM = 3

function loadMessages(chatId) {
  try {
    return JSON.parse(localStorage.getItem(`tailmates.chat.${chatId}`) ?? '[]')
  } catch {
    return []
  }
}

function saveMessages(chatId, messages) {
  try {
    localStorage.setItem(`tailmates.chat.${chatId}`, JSON.stringify(messages))
  } catch {
    // Storage blocked: the chat still works for this visit.
  }
}

// A chat with one other owner. From here you can send a one-off meet-up pin:
// a dog park and a time that either of you can open on the map or copy as a link.
export default function ChatPage() {
  const { chatId } = useParams()
  const chat = chats.find((item) => item.id === chatId)

  if (!chat) {
    return (
      <p className="chat-missing">
        We couldn&apos;t find that chat. <Link to="/social">Back to Social</Link>
      </p>
    )
  }

  return <ChatScreen key={chat.id} chat={chat} />
}

function ChatScreen({ chat }) {
  const [messages, setMessages] = useState(() => loadMessages(chat.id))
  const [draft, setDraft] = useState('')
  const [pinning, setPinning] = useState(false)

  function addMessage(message) {
    setMessages((current) => {
      const next = [...current, { id: Date.now(), from: 'me', ...message }]
      saveMessages(chat.id, next)
      return next
    })
  }

  function sendText(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    addMessage({ type: 'text', text })
    setDraft('')
  }

  return (
    <div className="chat">
      <h1 className="chat__title">{chat.name}</h1>

      <ul className="chat__messages" aria-label="Messages">
        <li className="bubble bubble--them">{chat.subtitle}</li>
        {messages.map((message) =>
          message.type === 'pin' ? (
            <PinMessage key={message.id} pin={message} />
          ) : (
            <li key={message.id} className="bubble bubble--me">
              {message.text}
            </li>
          ),
        )}
      </ul>

      {pinning ? (
        <PinComposer
          onCancel={() => setPinning(false)}
          onSend={(pin) => {
            addMessage({ type: 'pin', ...pin })
            setPinning(false)
          }}
        />
      ) : (
        <button
          type="button"
          className="button button--secondary chat__pin-button"
          onClick={() => setPinning(true)}
        >
          <MapPin size={18} aria-hidden="true" />
          Share a meet-up pin
        </button>
      )}

      <form className="chat__form" onSubmit={sendText}>
        <label className="visually-hidden" htmlFor="chat-draft">
          Message
        </label>
        <input
          id="chat-draft"
          className="chat__input"
          value={draft}
          placeholder="Write a message"
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="button button--primary chat__send" aria-label="Send">
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

function nextHalfHour() {
  const date = new Date(Date.now() + 30 * 60 * 1000)
  date.setMinutes(date.getMinutes() < 30 ? 0 : 30, 0, 0)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function PinComposer({ onCancel, onSend }) {
  const { location } = useUserLocation()
  const { places, status } = useNearbyPlaces({
    lat: location.lat,
    lon: location.lon,
    radiusKm: SEARCH_RADIUS_KM,
  })
  const dogParks = places.filter((place) => place.type === 'dogParks').slice(0, 6)
  const [placeId, setPlaceId] = useState(null)
  const [time, setTime] = useState(nextHalfHour)

  const chosen = dogParks.find((place) => place.id === placeId)

  return (
    <section className="composer" aria-label="New meet-up pin">
      <h2 className="composer__title">Where shall we meet?</h2>

      {status === 'loading' && <p className="composer__note">Looking for dog parks nearby…</p>}
      {status === 'error' && (
        <p className="composer__note">Couldn&apos;t reach the council&apos;s park data. Try again soon.</p>
      )}
      {status === 'ready' && dogParks.length === 0 && (
        <p className="composer__note">No off-leash areas within {SEARCH_RADIUS_KM} km.</p>
      )}

      <ul className="composer__places">
        {dogParks.map((place) => (
          <li key={place.id}>
            <button
              type="button"
              className="composer__place"
              aria-pressed={place.id === placeId}
              onClick={() => setPlaceId(place.id)}
            >
              <span>{place.name}</span>
              <span className="composer__distance">{formatDistance(place.distanceKm)}</span>
            </button>
          </li>
        ))}
      </ul>

      <label className="composer__time">
        <CalendarClock size={18} aria-hidden="true" />
        <span>Time today</span>
        <input type="time" value={time} onChange={(event) => setTime(event.target.value)} />
      </label>

      <div className="composer__actions">
        <button type="button" className="button button--secondary button--small" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="button button--primary button--small"
          disabled={!chosen || !time}
          onClick={() => onSend({ placeId: chosen.id, placeName: chosen.name, time })}
        >
          Send pin
        </button>
      </div>
    </section>
  )
}

// The shareable pin. The link opens the Map with this park already selected.
function PinMessage({ pin }) {
  const [copied, setCopied] = useState(false)
  const path = `/map?filter=dogParks&place=${encodeURIComponent(pin.placeId)}`
  const href = useHref(path)

  async function copyLink() {
    const url = new URL(href, window.location.href).toString()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked; the "Open on map" link still works.
    }
  }

  return (
    <li className="pin tone-accent">
      <p className="pin__label">One-off meet-up</p>
      <p className="pin__place">
        <MapPin size={18} aria-hidden="true" /> {pin.placeName}
      </p>
      <p className="pin__time">Today at {pin.time}</p>
      <div className="pin__actions">
        <Link to={path} className="button button--primary button--small">
          Open on map
        </Link>
        <button type="button" className="button button--secondary button--small" onClick={copyLink}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy link'}
        </button>
      </div>
    </li>
  )
}
