import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router'
import { createServer } from 'vite'
import { allChats, chats, followerIds, getOwnerProfile, groupChats, owners } from '../src/data/mockData.js'
import { getChatSummary, getConversations, loadMessages, saveMessages } from '../src/data/chatMessages.js'

let server
let SocialPage
let OwnerProfilePage
let ChatPage
let useSocialState
let WalkPage
let WalkDetailPage
let WalkHistory
let walkContext
let WalkContext
let LoadingScreen
const previousStorage = globalThis.localStorage

before(async () => {
  server = await createServer({
    server: { middlewareMode: true, hmr: false, watch: null },
    appType: 'custom',
    logLevel: 'error',
  })
  WalkContext = (await server.ssrLoadModule('/src/context/walkContext.js')).WalkContext
  SocialPage = (await server.ssrLoadModule('/src/pages/SocialPage.jsx')).default
  OwnerProfilePage = (await server.ssrLoadModule('/src/pages/OwnerProfilePage.jsx')).default
  ChatPage = (await server.ssrLoadModule('/src/pages/ChatPage.jsx')).default
  useSocialState = (await server.ssrLoadModule('/src/hooks/useSocialState.js')).default
  WalkPage = (await server.ssrLoadModule('/src/pages/WalkPage.jsx')).default
  WalkDetailPage = (await server.ssrLoadModule('/src/pages/WalkDetailPage.jsx')).default
  WalkHistory = (await server.ssrLoadModule('/src/components/WalkHistory.jsx')).default
  LoadingScreen = (await server.ssrLoadModule('/src/pages/LoadingScreen.jsx')).default
})

beforeEach(() => {
  walkContext = { walks: [], draft: null, gps: { status: 'idle' }, notice: '', shareWalk: noop }
  const data = new Map()
  globalThis.localStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  }
})

after(async () => {
  await server?.close()
  if (previousStorage === undefined) delete globalThis.localStorage
  else globalThis.localStorage = previousStorage
})

const noop = () => {}
const socialProps = (activeTab) => ({
  activeTab, setActiveTab: noop, followedIds: ['sam'], toggleFollow: noop,
  chatIds: chats.map((chat) => chat.id),
  chatFilter: 'all', setChatFilter: noop, chatStartedAt: {},
  searchQueries: { chats: '', following: '', followers: '' }, setSearchQuery: noop,
})

function renderRoute(path, route, component, props) {
  return renderToStaticMarkup(createElement(WalkContext.Provider, { value: walkContext }, createElement(MemoryRouter, { initialEntries: [path] },
    createElement(Routes, null,
      createElement(Route, { path: route, element: createElement(component, props) }),
    ),
  )))
}

test('the startup loading screen renders before the walk provider is mounted', () => {
  // Match App's initial render: the loading layout has no feature providers yet.
  const html = renderToStaticMarkup(createElement(MemoryRouter, null,
    createElement(LoadingScreen, { progress: 0 }),
  ))
  assert.ok(html.includes('Loading Tail Mates'))
  assert.ok(html.includes('role="progressbar"'))
  assert.ok(!html.includes('active-walk-banner'))
})

test('every owner has a complete public profile and one stable direct chat', () => {
  for (const person of owners) {
    const profile = getOwnerProfile(person)
    assert.ok(profile.owner.preferences)
    assert.ok(profile.owner.favouritePark)
    assert.equal(profile.dogs[0].name, person.dogName)
    assert.ok(profile.dogs[0].temperamentTags.length)
    assert.equal(allChats.filter((chat) => chat.ownerId === person.id).length, 1)

    const html = renderRoute(`/social/people/${person.id}`, '/social/people/:ownerId', OwnerProfilePage, socialProps('following'))
    assert.ok(html.includes(profile.owner.preferences))
    assert.ok(html.includes(`href="/social/chat/chat-${person.id}"`))
    assert.ok(html.includes('Walking preferences'))
    assert.ok(html.includes('Favourite park'))
    assert.ok(!html.includes('Edit profile'))
    assert.ok(!html.includes('Your dogs'))
  }
})

test('following offers profile and DM links with anchored suggestions and no walker directory', () => {
  const html = renderRoute('/social', '/social', SocialPage, socialProps('following'))
  const following = html.match(/<ul class="list" aria-label="People you follow">([\s\S]*?)<\/ul>/)[1]
  assert.ok(following.includes('href="/social/people/sam"'))
  assert.ok(following.includes('href="/social/chat/chat-sam"'))
  assert.ok(following.includes('Unfollow Sam &amp; Max'))
  assert.ok(following.includes('lucide-send'))
  assert.ok(html.includes('social-suggestions'))
  assert.ok(html.includes('social-page--suggestions'))
  assert.ok(!html.includes('All walkers'))
  for (const person of owners) {
    assert.ok(html.includes(`href="/social/people/${person.id}"`))
  }
  // A row action must never be nested inside its profile link.
  for (const anchor of html.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a>/g)) {
    assert.ok(!/<a\b|<button\b/.test(anchor[1]))
  }
})

test('every direct chat links back to the right profile, including new conversations', () => {
  for (const person of owners) {
    const html = renderRoute(`/social/chat/chat-${person.id}`, '/social/chat/:chatId', ChatPage, { onOpenChat: noop })
    assert.ok(html.includes(`href="/social/people/${person.id}"`))
    assert.ok(html.includes('View profile'))
    assert.ok(html.includes('aria-label="Send"'))
  }
})

test('each group has messages, valid senders, and profile and chat links for its members', () => {
  const groupsHtml = renderRoute('/social', '/social', SocialPage, { ...socialProps('chats'), chatFilter: 'groups' })
  for (const chat of groupChats) {
    assert.ok(groupsHtml.includes(`href="/social/chat/${chat.id}"`))
    assert.ok(chat.messages.length >= 3)
    assert.equal(new Set(chat.memberIds).size, chat.memberIds.length)
    const html = renderRoute(`/social/chat/${chat.id}`, '/social/chat/:chatId', ChatPage, { onOpenChat: noop })
    for (const message of chat.messages) {
      assert.ok(message.from === 'me' || chat.memberIds.includes(message.from))
      assert.ok(html.includes(message.text))
    }
    for (const id of chat.memberIds) {
      assert.ok(owners.some((owner) => owner.id === id))
      assert.ok(html.includes(`href="/social/people/${id}"`))
      assert.ok(html.includes(`href="/social/chat/chat-${id}"`))
    }
    assert.ok(html.includes(`Members (${chat.memberIds.length + 1})`))
    assert.ok(html.includes('bubble--them'))
    assert.ok(html.includes('class="chat-avatar" role="img" aria-label="Group chat"'))
  }
})

test('sent messages and pins persist separately from seeds and update chat previews', () => {
  const chat = groupChats[0]
  const sent = { id: 'sent-1', from: 'me', type: 'text', text: 'See you there!', sentAt: '7:00 pm' }
  saveMessages(chat.id, [sent])
  assert.deepEqual(loadMessages(chat.id), [sent])
  assert.equal(loadMessages('chat-mei').length, 0)
  assert.deepEqual(getChatSummary(chat), { subtitle: 'You: See you there!', time: '7:00 pm', lastActivityAt: chat.lastActivityAt })
  const html = renderRoute(`/social/chat/${chat.id}`, '/social/chat/:chatId', ChatPage, { onOpenChat: noop })
  assert.equal(html.split(sent.text).length - 1, 1)
  assert.ok(html.includes(chat.messages[0].text))

  const pin = { id: 'pin-1', from: 'me', type: 'pin', placeId: 'park-1', placeName: 'New Farm Park', time: '17:00', sentAt: '7:01 pm' }
  saveMessages(chat.id, [sent, pin])
  assert.deepEqual(loadMessages(chat.id), [sent, pin])
  assert.equal(getChatSummary(chat).subtitle, 'You: Meet-up at New Farm Park')
})

test('invalid saved messages and blocked storage do not break conversations', () => {
  for (const value of ['{bad', 'null', '{}', '[null, {"id":1,"type":"text","from":"me"}]', '[{"id":1,"type":"text","from":"me","text":"hello","sentAt":{}}]']) {
    localStorage.setItem('tailmates.chat.chat-sam', value)
    assert.deepEqual(loadMessages('chat-sam'), [])
  }
  const blocked = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } }
  assert.deepEqual(loadMessages('chat-sam', blocked), [])
  assert.doesNotThrow(() => saveMessages('chat-sam', [], blocked))
})

test('saved social tabs, follows, and newly opened chats survive reload and older saves', () => {
  function readState() {
    function Probe() {
      return createElement('script', { type: 'application/json' }, JSON.stringify(useSocialState()))
    }
    const html = renderToStaticMarkup(createElement(Probe))
    return JSON.parse(html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>')))
  }
  assert.equal(readState().activeTab, 'chats')
  localStorage.setItem('tailmates.social', JSON.stringify({ activeTab: 'following', followedIds: ['sam'] }))
  assert.equal(readState().activeTab, 'following')
  assert.deepEqual(readState().followedIds, ['sam'])
  assert.ok(readState().chatIds.includes(groupChats[0].id))
  localStorage.setItem('tailmates.social', JSON.stringify({ activeTab: 'groups', followedIds: ['missing'], chatIds: ['chat-mei', 'missing', 'chat-mei'] }))
  assert.equal(readState().activeTab, 'chats')
  assert.equal(readState().chatFilter, 'groups')
  assert.equal(readState().chatIds[0], 'chat-mei')
  assert.equal(readState().chatIds.filter((id) => id === 'chat-mei').length, 1)
  assert.ok(!readState().chatIds.includes('missing'))
  assert.deepEqual(readState().followedIds, [])
  localStorage.setItem('tailmates.social', JSON.stringify({
    activeTab: 'followers', chatFilter: 'direct', searchQueries: { chats: 'Luna', followers: 'Mei' },
  }))
  assert.equal(readState().activeTab, 'followers')
  assert.equal(readState().chatFilter, 'direct')
  assert.equal(readState().searchQueries.chats, 'Luna')
  assert.equal(readState().searchQueries.followers, 'Mei')
  assert.equal(readState().searchQueries.following, '')
})

test('merged chats can filter direct and group conversations and search names or members', () => {
  const ids = chats.map((chat) => chat.id)
  const all = getConversations(ids)
  assert.ok(all.some((chat) => chat.isGroup))
  assert.ok(all.some((chat) => !chat.isGroup))
  assert.ok(getConversations(ids, { filter: 'direct' }).every((chat) => !chat.isGroup))
  assert.ok(getConversations(ids, { filter: 'groups' }).every((chat) => chat.isGroup))
  const luna = getConversations(ids, { query: '  LUNA  ' })
  assert.ok(luna.some((chat) => chat.id === 'chat-priya'))
  assert.ok(luna.some((chat) => chat.id === 'group-riverside-walkers'))
  assert.deepEqual(getConversations(ids, { query: 'no such person' }), [])
  const html = renderRoute('/social', '/social', SocialPage, {
    ...socialProps('chats'), chatFilter: 'direct', searchQueries: { chats: 'Luna' },
  })
  assert.ok(html.includes('Search chats'))
  assert.ok(html.includes('href="/social/chat/chat-priya"'))
  assert.ok(!html.includes('href="/social/chat/group-'))
  assert.ok(!html.includes('href="/social/chat/chat-sam"'))
})

test('conversations sort by message timestamps, including groups, pins and newly started chats', () => {
  const ids = chats.map((chat) => chat.id).reverse()
  const before = getConversations(ids)
  assert.equal(before[0].id, 'chat-sam')
  assert.equal(before[1].id, 'group-riverside-walkers')
  const createdAt = Date.now()
  saveMessages('group-puppy-socials', [{ id: 'new', from: 'me', type: 'text', text: 'Hello', createdAt }])
  const after = getConversations(ids)
  assert.equal(after[0].id, 'group-puppy-socials')
  assert.equal(after[0].subtitle, 'You: Hello')
  assert.deepEqual(after.map((chat) => chat.lastActivityAt), after.map((chat) => chat.lastActivityAt).sort((a, b) => b - a))
  saveMessages('chat-tom', [{ id: 'new-pin', from: 'me', type: 'pin', placeId: 'park-1', placeName: 'New Farm Park', time: '17:00', createdAt: createdAt + 1 }])
  assert.equal(getConversations(ids)[0].id, 'chat-tom')
  assert.equal(getConversations([...ids, 'chat-mei'], { startedAt: { 'chat-mei': createdAt + 2 } })[0].id, 'chat-mei')
})

test('followers are independent of following and offer profile, DM, follow-back and search', () => {
  const props = { ...socialProps('followers'), followedIds: [] }
  const html = renderRoute('/social', '/social', SocialPage, props)
  assert.ok(html.includes('aria-label="Your followers"'))
  assert.ok(html.includes('Search followers'))
  assert.ok(html.includes('Follow back'))
  assert.ok(!html.includes('social-suggestions'))
  for (const id of followerIds) {
    assert.ok(html.includes(`href="/social/people/${id}"`))
    assert.ok(html.includes(`href="/social/chat/chat-${id}"`))
  }
  const filtered = renderRoute('/social', '/social', SocialPage, { ...props, searchQueries: { followers: 'Mei' } })
  assert.ok(filtered.includes('href="/social/people/mei"'))
  assert.ok(!filtered.includes('href="/social/people/sam"'))
  const following = renderRoute('/social', '/social', SocialPage, {
    ...socialProps('following'), followedIds: ['sam', 'tom'], searchQueries: { following: 'Corgi' },
  })
  const list = following.match(/<ul class="list" aria-label="People you follow">([\s\S]*?)<\/ul>/)[1]
  assert.ok(list.includes('href="/social/people/tom"'))
  assert.ok(!list.includes('href="/social/people/sam"'))
  assert.ok(following.includes('Search following'))
})

test('unknown profiles and conversations provide a way back to Social', () => {
  for (const [path, route, component, props] of [
    ['/social/people/missing', '/social/people/:ownerId', OwnerProfilePage, socialProps('following')],
    ['/social/chat/missing', '/social/chat/:chatId', ChatPage, { onOpenChat: noop }],
  ]) {
    assert.ok(renderRoute(path, route, component, props).includes('href="/social"'))
  }
})

const routeFixture = {
  id: 'saved-walk', ownerId: 'me', title: 'Morning dog walk', visibility: 'private', sharedChatIds: [],
  startedAt: 1792300000000, endedAt: 1792300600000, elapsedMs: 600000,
  points: [
    { lat: -27.47, lon: 153.02, at: 1792300000000, accuracy: 5, segment: 0 },
    { lat: -27.471, lon: 153.02, at: 1792300100000, accuracy: 5, segment: 0 },
  ],
}

test('walk review defaults to private and asks before saving or publishing', () => {
  walkContext.draft = { ...routeFixture, phase: 'review' }
  const html = renderRoute('/walk', '/walk', WalkPage)
  assert.ok(html.includes('Save your walk?'))
  assert.match(html, /value="private"[^>]*checked=""|checked=""[^>]*value="private"/)
  assert.ok(html.includes('Save privately'))
  assert.ok(html.includes('Discard walk'))
  assert.ok(!html.includes('Publish to followers'))
})

test('walk history shows both privacy levels to the owner and routes are linked', () => {
  walkContext.walks = [routeFixture, { ...routeFixture, id: 'shared-walk', visibility: 'followers' }]
  const html = renderRoute('/profile', '/profile', WalkHistory)
  assert.ok(html.includes('href="/walks/saved-walk"'))
  assert.ok(html.includes('href="/walks/shared-walk"'))
  assert.ok(html.includes('Private'))
  assert.ok(html.includes('Followers'))
  assert.ok(html.includes('Preview follower view'))
})

test('private routes are hidden in follower previews, and shared routes have no owner controls', () => {
  walkContext.walks = [routeFixture]
  const privateHtml = renderRoute('/walks/saved-walk?view=follower', '/walks/:walkId', WalkDetailPage)
  assert.ok(privateHtml.includes('Walk unavailable'))
  assert.ok(!privateHtml.includes('Morning dog walk'))
  assert.ok(!privateHtml.includes('walk-map'))
  walkContext.walks = [{ ...routeFixture, visibility: 'followers' }]
  const followersHtml = renderRoute('/walks/saved-walk?view=follower', '/walks/:walkId', WalkDetailPage)
  assert.ok(followersHtml.includes('Morning dog walk'))
  assert.ok(!followersHtml.includes('Delete walk'))
  assert.ok(!followersHtml.includes('Who can see this walk?'))
})

test('shared route messages link to a live walk and lose the route when it is deleted', () => {
  const walk = { ...routeFixture, sharedChatIds: ['chat-sam'] }
  walkContext.walks = [walk]
  const message = { id: 'route-message', from: 'me', type: 'walk', walkId: walk.id, createdAt: Date.now() }
  saveMessages('chat-sam', [message])
  assert.deepEqual(loadMessages('chat-sam'), [message])
  assert.equal(getChatSummary(allChats.find((chat) => chat.id === 'chat-sam')).subtitle, 'You: Shared a walk route')
  const before = renderRoute('/social/chat/chat-sam', '/social/chat/:chatId', ChatPage, { onOpenChat: noop })
  assert.ok(before.includes('href="/walks/saved-walk?chat=chat-sam"'))
  assert.ok(before.includes('Morning dog walk'))
  assert.ok(!JSON.stringify(message).includes('153.02'))
  walkContext.walks = []
  const after = renderRoute('/social/chat/chat-sam', '/social/chat/:chatId', ChatPage, { onOpenChat: noop })
  assert.ok(after.includes('This walk is no longer available.'))
  assert.ok(!after.includes('Morning dog walk'))
  assert.ok(!after.includes('href="/walks/saved-walk'))
})
