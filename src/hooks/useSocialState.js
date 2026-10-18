import { useCallback, useEffect, useState } from 'react'
import { allChats, chats, owners } from '../data/mockData.js'

const STORAGE_KEY = 'tailmates.social'

function readStored() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    return {
      activeTab: ['chats', 'following', 'followers'].includes(saved?.activeTab)
        ? saved.activeTab
        : 'chats',
      chatFilter: saved?.activeTab === 'groups' ? 'groups'
        : ['all', 'direct', 'groups'].includes(saved?.chatFilter) ? saved.chatFilter : 'all',
      searchQueries: Object.fromEntries(['chats', 'following', 'followers'].map((tab) =>
        [tab, typeof saved?.searchQueries?.[tab] === 'string' ? saved.searchQueries[tab].slice(0, 200) : ''],
      )),
      chatStartedAt: Object.fromEntries(allChats
        .filter((chat) => Number.isFinite(saved?.chatStartedAt?.[chat.id]) && saved.chatStartedAt[chat.id] >= 0)
        .map((chat) => [chat.id, saved.chatStartedAt[chat.id]])),
      followedIds: Array.isArray(saved?.followedIds)
        ? owners.filter((person) => saved.followedIds.includes(person.id)).map((person) => person.id)
        : [],
      chatIds: [...new Set([
        ...(Array.isArray(saved?.chatIds) ? saved.chatIds.filter((id) => allChats.some((chat) => chat.id === id)) : []),
        ...chats.map((chat) => chat.id),
      ])],
    }
  } catch {
    return {
      activeTab: 'chats', chatFilter: 'all',
      searchQueries: { chats: '', following: '', followers: '' }, chatStartedAt: {},
      followedIds: [], chatIds: chats.map((chat) => chat.id),
    }
  }
}

// Kept in App so navigation preserves both choices even when storage is blocked.
export default function useSocialState() {
  const [social, setSocial] = useState(readStored)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(social))
    } catch {
      // The current visit still works if the browser cannot save these choices.
    }
  }, [social])

  function setActiveTab(activeTab) {
    setSocial((current) => ({ ...current, activeTab }))
  }

  function setChatFilter(chatFilter) {
    setSocial((current) => ({ ...current, chatFilter }))
  }

  function setSearchQuery(tab, value) {
    setSocial((current) => ({ ...current, searchQueries: { ...current.searchQueries, [tab]: value } }))
  }

  function toggleFollow(id) {
    setSocial((current) => ({
      ...current,
      followedIds: current.followedIds.includes(id)
        ? current.followedIds.filter((personId) => personId !== id)
        : [...current.followedIds, id],
    }))
  }

  const openChat = useCallback((id) => {
    setSocial((current) => current.chatIds.includes(id)
      ? current
      : {
        ...current,
        chatIds: [...current.chatIds, id],
        chatStartedAt: { ...current.chatStartedAt, [id]: Date.now() },
      })
  }, [])

  return { ...social, setActiveTab, setChatFilter, setSearchQuery, toggleFollow, openChat }
}
