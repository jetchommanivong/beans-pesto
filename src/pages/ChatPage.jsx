import { useEffect, useState } from 'react'
import { Link, useHref, useParams } from 'react-router'
import { CalendarClock, Check, ChevronRight, Copy, MapPin, Send } from 'lucide-react'
import Avatar from '../components/Avatar.jsx'
import ChatAvatar from '../components/ChatAvatar.jsx'
import ListItem from '../components/ListItem.jsx'
import OwnerListItem from '../components/OwnerListItem.jsx'
import useNearbyPlaces from '../hooks/useNearbyPlaces.js'
import useUserLocation from '../hooks/useUserLocation.js'
import { formatDistance } from '../data/brisbaneOpenData.js'
import { allChats, owners } from '../data/mockData.js'
import { loadMessages, saveMessages } from '../data/chatMessages.js'
import './ChatPage.css'

const SEARCH_RADIUS_KM = 3

// Direct and group conversations share the same messages and meet-up composer.
export default function ChatPage({ onOpenChat }) {
  const { chatId } = useParams()
  const chat = allChats.find((item) => item.id === chatId)

  if (!chat) {
    return (
      <p className="chat-missing">
        We couldn&apos;t find that chat. <Link to="/social">Back to Social</Link>
      </p>
    )
  }

  return <ChatScreen key={chat.id} chat={chat} onOpenChat={onOpenChat} />
}

function ChatScreen({ chat, onOpenChat }) {
  const [messages, setMessages] = useState(() => loadMessages(chat.id))
  const [draft, setDraft] = useState('')
  const [pinning, setPinning] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    onOpenChat(chat.id)
  }, [chat.id, onOpenChat])

  useEffect(() => {
    saveMessages(chat.id, messages)
  }, [chat.id, messages])

  function addMessage(message) {
    const next = {
      id: globalThis.crypto?.randomUUID?.() ?? `message-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      from: 'me',
      createdAt: Date.now(),
      sentAt: new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }),
      ...message,
    }
    setMessages((current) => [...current, next])
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
      {chat.isGroup ? (
        <header className="chat__identity">
          <ChatAvatar chat={chat} />
          <div className="chat__identity-text">
            <h1 className="chat__title">{chat.name}</h1>
            <p className="chat__subtitle">{chat.subtitle}</p>
          </div>
        </header>
      ) : (
        <Link to={`/social/people/${chat.ownerId}`} className="chat__identity">
          <Avatar name={chat.name} tone={chat.tone} />
          <div className="chat__identity-text">
            <h1 className="chat__title">{chat.name}</h1>
            <p className="chat__subtitle">View profile</p>
          </div>
          <ChevronRight size={20} aria-hidden="true" />
        </Link>
      )}

      {chat.isGroup && (
        <details className="chat__members">
          <summary>Members ({chat.memberIds.length + 1})</summary>
          <ul className="list" aria-label="Group members">
            <ListItem title="You" subtitle="Your profile" tone="primary" to="/profile" />
            {chat.memberIds.map((id) => {
              const person = owners.find((owner) => owner.id === id)
              return <OwnerListItem key={id} person={person} />
            })}
          </ul>
        </details>
      )}

      <ul className="chat__messages" aria-label="Messages">
        {chat.messages.length === 0 && messages.length === 0 && (
          <li className="chat__empty">Say hello to {chat.name} and plan your next walk.</li>
        )}
        {[...chat.messages, ...messages].map((message) =>
          message.type === 'pin' ? (
            <PinMessage key={message.id} pin={message} />
          ) : (
            <TextMessage key={message.id} message={message} isGroup={chat.isGroup} />
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

function TextMessage({ message, isGroup }) {
  const sender = owners.find((person) => person.id === message.from)
  const isMe = message.from === 'me'
  const time = message.sentAt ?? message.time

  return (
    <li className={`bubble ${isMe ? 'bubble--me' : 'bubble--them'}`}>
      {isGroup && sender && (
        <Link to={`/social/people/${sender.id}`} className="bubble__sender">{sender.name}</Link>
      )}
      <p>{message.text}</p>
      {time && <span className="bubble__time">{time}</span>}
    </li>
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
