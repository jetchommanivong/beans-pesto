import { Link } from 'react-router'
import { ExternalLink, House } from 'lucide-react'
import { DATASETS } from '../data/brisbaneOpenData.js'
import './AboutPage.css'

// About page: purpose, team, data assumptions and sources.
//
// The dataset ids come from DATASETS rather than being written out here, so the
// links can never point somewhere the app no longer reads.
const SOURCES = [
  {
    id: DATASETS.dogParks,
    title: 'Park — Dog off-leash areas',
    description: 'Dog parks, off-leash boundaries and facilities.',
  },
  {
    id: DATASETS.parks,
    title: 'Park — Locations',
    description: 'Park names, locations and sizes.',
  },
  {
    id: DATASETS.fountains,
    title: 'Park — Drinking fountain tap locations',
    description: 'Drinking fountains and water taps in parks.',
  },
]

export default function AboutPage() {
  return (
    <div className="about-page">
      <header className="about-heading">
        <h1>About Tail Mates</h1>
        <p>
          Find dog-friendly places, record your walks and connect with other dog owners.
        </p>
      </header>

      <section className="about-section" aria-labelledby="about-purpose">
        <h2 id="about-purpose">Purpose</h2>
        <p>
          Tail Mates helps Brisbane dog owners plan better walks and meet other owners nearby. The
          map shows off-leash dog parks, parks and drinking fountains from Brisbane City Council
          open data. Owners can set their dog&apos;s size and temperament, chat, and agree a
          meet-up with a pin. Privacy comes first: location sharing and suggestions to other owners
          start Off, and the meet-up pin replaces live tracking.
        </p>
      </section>

      <section className="about-section" aria-labelledby="about-team">
        <h2 id="about-team">Team</h2>
        <p>
          DECO1800 Design Computing Studio I, team Beans (Pesto?): Jet Chommanivong, Misri Patel,
          Vairavan Sundararajan, William Mahoney and Xiangyu Ji.
        </p>
      </section>

      <section className="about-section" aria-labelledby="about-assumptions">
        <h2 id="about-assumptions">Assumptions and disclaimers</h2>
        <ul className="about-list">
          <li>
            Park, dog park and water locations come from Brisbane City Council open data. We show
            only the fields the datasets supply and make no live safety or crowding claims.
          </li>
          <li>
            The council API returns at most 100 records per request, so the map shows the nearest
            records within 3 km, capped per layer.
          </li>
          <li>
            The Small, Medium and Large filters describe park area (the council&apos;s 2,500 and
            10,000 square metre bands), not dog size. The council has no large-dog or mixed
            category.
          </li>
          <li>
            Other owners, their dogs and their messages are fictional sample data. Nothing you
            enter is sent to a server: your profile, privacy settings, chats and recorded walks
            stay in this browser, so clearing the browser clears them.
          </li>
          <li>
            The privacy switches control what this prototype displays. No location is shared with
            anyone else.
          </li>
          <li>
            Tail Mates is a student prototype and not safety advice. Always judge for yourself
            whether a park or another dog is safe.
          </li>
        </ul>
      </section>

      <section className="about-section" aria-labelledby="about-data">
        <h2 id="about-data">Data sources</h2>
        <p>
          Park, dog park and drinking-water locations come from Brisbane City Council&apos;s open
          data portal.
        </p>
        <ul className="about-sources">
          {SOURCES.map((source) => (
            <li key={source.id}>
              <a
                href={`https://data.brisbane.qld.gov.au/explore/dataset/${source.id}/`}
                target="_blank"
                rel="noreferrer"
              >
                <span>{source.title}</span>
                <ExternalLink size={15} aria-hidden="true" />
              </a>
              <p>{source.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="about-section" aria-labelledby="about-credits">
        <h2 id="about-credits">Credits</h2>
        <ul className="about-list">
          <li>
            Map: Leaflet (Agafonkin, 2023) via react-leaflet, with tiles ©{' '}
            <a
              href="https://www.openstreetmap.org/copyright"
              target="_blank"
              rel="noreferrer"
            >
              OpenStreetMap contributors
            </a>
            .
          </li>
          <li>Built with React, React Router, Vite and lucide-react icons.</li>
        </ul>
      </section>

      <section className="about-section" aria-labelledby="about-ai">
        <h2 id="about-ai">Use of AI tools</h2>
        <p>
          Some team members used generative AI tools during development and writing. Which tools,
          what for, and how we checked the results are set out in the team&apos;s AI Use
          Declaration submitted with this project.
        </p>
      </section>

      <Link to="/" className="button button--primary">
        <House size={18} aria-hidden="true" />
        Back to Home
      </Link>
    </div>
  )
}
