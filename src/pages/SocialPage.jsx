import { useState } from 'react'
import { Check, Search, UserPlus, X } from 'lucide-react'
import { Link } from 'react-router'
import Avatar from '../components/Avatar.jsx'
import ChatAvatar from '../components/ChatAvatar.jsx'
import ListItem from '../components/ListItem.jsx'
import OwnerListItem from '../components/OwnerListItem.jsx'
import { followerIds, owners } from '../data/mockData.js'
import { getConversations } from '../data/chatMessages.js'
import './SocialPage.css'

const TABS = [
  { id: 'chats', label: 'Chats' },
  { id: 'following', label: 'Following' },
  { id: 'followers', label: 'Followers' },
]
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'direct', label: 'Chats' },
  { id: 'groups', label: 'Groups' },
]

export default function SocialPage({
  activeTab, setActiveTab, followedIds, toggleFollow, chatIds,
  chatFilter, setChatFilter, searchQueries, setSearchQuery, chatStartedAt,
}) {
  // Keep this visit's cards in place while their Follow buttons change state.
  const [suggestions] = useState(() => owners.filter((person) => !followedIds.includes(person.id)))
  const query = searchQueries[activeTab]
  const search = query.trim().toLocaleLowerCase()
  const isChats = activeTab === 'chats'
  const people = owners.filter((person) =>
    (activeTab === 'followers' ? followerIds : followedIds).includes(person.id),
  )
  const filteredPeople = people.filter((person) =>
    [person.name, person.dog, person.suburb].join(' ').toLocaleLowerCase().includes(search),
  )
  const conversations = getConversations(chatIds, {
    filter: chatFilter, query, startedAt: chatStartedAt,
  })
  const showSuggestions = activeTab === 'following' && suggestions.length > 0
  const searchLabel = isChats ? 'Search chats' : `Search ${activeTab}`

  return (
    <div className={`social-page${showSuggestions ? ' social-page--suggestions' : ''}`}>
      <h1 className="visually-hidden">Social</h1>
      <div className="tabs" role="tablist" aria-label="Social sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            className="tabs__tab"
            aria-selected={activeTab === tab.id}
            aria-controls="social-panel"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div id="social-panel" className="social-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        <div className="social-search" role="search" aria-label={searchLabel}>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            aria-label={searchLabel}
            placeholder={isChats ? 'Search people or chats' : 'Search people'}
            value={query}
            maxLength={200}
            onChange={(event) => setSearchQuery(activeTab, event.target.value)}
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setSearchQuery(activeTab, '')}>
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {isChats ? (
          <>
            <div className="chat-filters" role="group" aria-label="Filter conversations">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={chatFilter === filter.id}
                  onClick={() => setChatFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
              <span className="chat-filters__sort">Most recent</span>
            </div>
            {conversations.length > 0 ? (
              <ul className="list" aria-label="Conversations">
                {conversations.map((chat) => (
                  <ListItem
                    key={chat.id}
                    title={chat.name}
                    subtitle={chat.isGroup ? `Group · ${chat.subtitle}` : chat.subtitle}
                    meta={chat.time}
                    avatar={<ChatAvatar chat={chat} />}
                    to={`/social/chat/${chat.id}`}
                  />
                ))}
              </ul>
            ) : <p className="social-empty">{search ? 'No conversations match your search.' : 'No conversations here yet.'}</p>}
          </>
        ) : (
          <section>
            <SectionHeading title={activeTab === 'followers' ? 'Followers' : 'Following'} count={people.length} />
            {filteredPeople.length > 0 ? (
              <ul className="list" aria-label={activeTab === 'followers' ? 'Your followers' : 'People you follow'}>
                {filteredPeople.map((person) => {
                  const following = followedIds.includes(person.id)
                  return (
                    <OwnerListItem
                      key={person.id}
                      person={person}
                      action={
                        <button
                          type="button"
                          className={`button button--secondary ${following ? 'owner-message' : 'button--small social-follow-back'}`}
                          aria-label={`${following ? 'Unfollow' : 'Follow back'} ${person.name}`}
                          aria-pressed={following}
                          title={`${following ? 'Unfollow' : 'Follow back'} ${person.name}`}
                          onClick={() => toggleFollow(person.id)}
                        >
                          {following ? <Check size={16} aria-hidden="true" /> : 'Follow back'}
                        </button>
                      }
                    />
                  )
                })}
              </ul>
            ) : (
              <div className="social-empty">
                {search ? <p>No people match your search.</p> : activeTab === 'following' ? (
                  <>
                    <p>You aren&apos;t following anyone yet.</p>
                    <p>Find a familiar face or a new walking buddy below.</p>
                  </>
                ) : <p>No followers yet.</p>}
              </div>
            )}
          </section>
        )}
      </div>

      {showSuggestions && (
        <section className="social-suggestions" aria-label="Suggested">
          <SectionHeading title="Suggested" />
          <ul className="people-row" aria-label="Suggested profiles">
            {suggestions.map((person) => {
              const following = followedIds.includes(person.id)
              return (
                <li key={person.id} className="person-card">
                  <Link to={`/social/people/${person.id}`} className="person-card__profile" aria-label={`View ${person.name}'s profile`}>
                    <Avatar name={person.name} tone={person.tone} size={40} />
                    <p className="person-card__name">{person.name}</p>
                    <p className="person-card__dog">{person.dog}</p>
                  </Link>
                  <button
                    type="button"
                    className={`button button--small ${following ? 'button--secondary' : 'button--primary'}`}
                    aria-label={`${following ? 'Unfollow' : 'Follow'} ${person.name}`}
                    aria-pressed={following}
                    onClick={() => toggleFollow(person.id)}
                  >
                    {following ? <Check size={16} aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />}
                    {following ? 'Following' : 'Follow'}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

function SectionHeading({ title, count }) {
  return (
    <div className="section-heading">
      <h2 className="section-heading__title">{title}</h2>
      {count !== undefined && <span className="section-heading__count">{count}</span>}
    </div>
  )
}
