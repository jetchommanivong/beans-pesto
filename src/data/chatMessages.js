import { allChats, owners } from './mockData.js'

// Saved messages are appended to the sample conversation, so seeds never duplicate.
export function loadMessages(chatId, storage) {
  try {
    const saved = JSON.parse((storage ?? localStorage).getItem(`tailmates.chat.${chatId}`) ?? '[]')
    return Array.isArray(saved) ? saved.filter((message) =>
      message && (typeof message.id === 'string' || typeof message.id === 'number') &&
      (message.sentAt == null || typeof message.sentAt === 'string') &&
      (message.time == null || typeof message.time === 'string') &&
      (message.createdAt == null || (Number.isFinite(message.createdAt) && message.createdAt >= 0)) &&
      message.from === 'me' && (
        (message.type === 'text' && typeof message.text === 'string') ||
        (message.type === 'pin' && typeof message.placeId === 'string' &&
          typeof message.placeName === 'string' && typeof message.time === 'string')
      ),
    ) : []
  } catch {
    return []
  }
}

export function saveMessages(chatId, messages, storage) {
  try {
    (storage ?? localStorage).setItem(`tailmates.chat.${chatId}`, JSON.stringify(messages))
  } catch {
    // The conversation still works for this visit if storage is unavailable.
  }
}

export function getChatSummary(chat, storage) {
  const last = loadMessages(chat.id, storage).at(-1) ?? chat.messages.at(-1)
  const lastActivityAt = last?.createdAt
    ?? (typeof last?.id === 'number' && last.id > 1e12 ? last.id : chat.lastActivityAt ?? 0)
  if (!last) return { subtitle: chat.subtitle, time: chat.time, lastActivityAt }
  const text = last.type === 'pin' ? `Meet-up at ${last.placeName}` : last.text
  return {
    subtitle: last.from === 'me' ? `You: ${text}` : text,
    time: last.sentAt ?? chat.time,
    lastActivityAt,
  }
}
export function getConversations(chatIds, { filter = 'all', query = '', startedAt = {}, storage } = {}) {
  const search = query.trim().toLocaleLowerCase()
  return chatIds
    .map((id) => allChats.find((chat) => chat.id === id))
    .filter(Boolean)
    .map((chat) => {
      const summary = getChatSummary(chat, storage)
      return { ...chat, ...summary, lastActivityAt: Math.max(summary.lastActivityAt, startedAt[chat.id] ?? 0) }
    })
    .filter((chat) => filter === 'all' || (filter === 'groups' ? chat.isGroup : !chat.isGroup))
    .filter((chat) => {
      const members = owners.filter((person) => chat.memberIds?.includes(person.id) || person.id === chat.ownerId)
      return [chat.name, chat.subtitle, ...members.map((person) => person.name)].join(' ').toLocaleLowerCase().includes(search)
    })
    .sort((a, b) => b.lastActivityAt - a.lastActivityAt || a.name.localeCompare(b.name))
}
