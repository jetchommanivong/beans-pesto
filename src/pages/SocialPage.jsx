import { useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Check, UserPlus } from 'lucide-react'
import Avatar from '../components/Avatar.jsx'
import ListItem from '../components/ListItem.jsx'
import { chats, groups, owners } from '../data/mockData.js'
import './SocialPage.css'

const TABS = [
  { id: 'following', label: 'Following' },
  { id: 'groups', label: 'Groups' },
  { id: 'chats', label: 'Chats' },
]

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState('following')
  const [followedIds, setFollowedIds] = useState([])

  function toggleFollow(id) {
    setFollowedIds((current) =>
      current.includes(id) ? current.filter((personId) => personId !== id) : [...current, id],
    )
  }

  return (
    <div className="social-page">
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

      <div id="social-panel" role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'following' && (
          <>
            <section className="social-section">
              <SectionHeading title="People to follow" />
              <ul className="people-row">
                {owners.map((person) => {
                  const isFollowing = followedIds.includes(person.id)
                  return (
                    <li key={person.id} className="person-card">
                      <Avatar name={person.name} tone={person.tone} size={56} />
                      <p className="person-card__name">{person.name}</p>
                      <p className="person-card__dog">{person.dog}</p>
                      <button
                        type="button"
                        className={`button button--small ${isFollowing ? 'button--secondary' : 'button--primary'}`}
                        onClick={() => toggleFollow(person.id)}
                      >
                        {isFollowing ? (
                          <Check size={16} aria-hidden="true" />
                        ) : (
                          <UserPlus size={16} aria-hidden="true" />
                        )}
                        {isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section className="social-section">
              <SectionHeading title="Groups & chats" />
              <ul className="list">
                {groups.slice(0, 2).map((group) => (
                  <ListItem key={group.id} title={group.name} subtitle={group.subtitle} tone={group.tone} />
                ))}
                {chats.slice(0, 2).map((chat) => (
                  <ListItem
                    key={chat.id}
                    title={chat.name}
                    subtitle={chat.subtitle}
                    meta={chat.time}
                    tone={chat.tone}
                  />
                ))}
              </ul>
            </section>
          </>
        )}

        {activeTab === 'groups' && (
          <ul className="list">
            {groups.map((group) => (
              <ListItem key={group.id} title={group.name} subtitle={group.subtitle} tone={group.tone} />
            ))}
          </ul>
        )}

        {activeTab === 'chats' && (
          <ul className="list">
            {chats.map((chat) => (
              <ListItem
                key={chat.id}
                title={chat.name}
                subtitle={chat.subtitle}
                meta={chat.time}
                tone={chat.tone}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function SectionHeading({ title }) {
  return (
    <div className="section-heading">
      <h2 className="section-heading__title">{title}</h2>
      <Link to="/coming-soon" className="section-heading__link">
        See all <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  )
}
