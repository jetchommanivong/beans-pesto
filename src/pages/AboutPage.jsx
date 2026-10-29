import { Link } from 'react-router'
import { House } from 'lucide-react'
import './AboutPage.css'

// About page: purpose, team, data assumptions and sources.
export default function AboutPage() {
  return (
    <div className="about">
      <h1 className="about__title">About Tail Mates</h1>

      <section className="about__section">
        <h2>Purpose</h2>
        <p>
          Tail Mates helps Brisbane dog owners plan better walks and meet other owners nearby.
          The map shows off-leash dog parks, parks and drinking fountains from Brisbane City
          Council open data. Owners can set their dog&apos;s size and temperament, chat, and agree
          a meet-up with a pin. Privacy comes first: location sharing and suggestions to other
          owners start Off, and the meet-up pin replaces live tracking.
        </p>
      </section>

      <section className="about__section">
        <h2>Team</h2>
        <p>
          DECO1800 Design Computing Studio I, team Beans (Pesto?): Jet Chommanivong, Misri Patel,
          Vairavan Sundararajan, William Mahoney and Xiangyu Ji.
        </p>
      </section>

      <section className="about__section">
        <h2>Assumptions and disclaimers</h2>
        <ul>
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
            The walk recorder uses your device&apos;s GPS, ignores low-accuracy readings, starts a
            new segment after a gap and needs the app open with the screen on.
          </li>
          <li>
            Tail Mates is a student prototype and not safety advice. Always judge for yourself
            whether a park or another dog is safe.
          </li>
        </ul>
      </section>

      <section className="about__section">
        <h2>Sources and credits</h2>
        <ul>
          <li>
            Map: Leaflet (Agafonkin, 2023) via react-leaflet, with tiles ©{' '}
            <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>.
          </li>
          <li>
            Data:{' '}
            <a href="https://data.brisbane.qld.gov.au">Brisbane City Council open data</a> (Park:
            Dog off-leash areas; Park: Drinking fountain tap locations; Park locations).
          </li>
          <li>Built with React, React Router, Vite and lucide-react icons.</li>
        </ul>
      </section>

      <section className="about__section">
        <h2>Use of AI tools</h2>
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
