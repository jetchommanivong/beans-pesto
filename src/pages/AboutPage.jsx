import { ExternalLink } from 'lucide-react'
import { DATASETS } from '../data/brisbaneOpenData.js'
import './AboutPage.css'

const SOURCES = [
  { id: DATASETS.parks, title: 'Park — Locations', description: 'Park names, locations and sizes.' },
  { id: DATASETS.dogParks, title: 'Park — Dog off-leash areas', description: 'Dog parks, off-leash boundaries and facilities.' },
  { id: DATASETS.fountains, title: 'Park — Drinking Fountain Tap locations', description: 'Drinking fountains and water taps in parks.' },
]

export default function AboutPage() {
  return <div className="about-page">
    <header className="about-heading">
      <h1>About Tail Mates</h1>
      <p>Find dog-friendly places, record your walks and connect with other dog owners.</p>
    </header>
    <section className="about-section" aria-labelledby="about-data">
      <h2 id="about-data">Data sources</h2>
      <p>Park, dog park and drinking-water locations come from Brisbane City Council's open data portal.</p>
      <ul className="about-sources">
        {SOURCES.map((source) => <li key={source.id}>
          <a href={`https://data.brisbane.qld.gov.au/explore/dataset/${source.id}/`} target="_blank" rel="noreferrer">
            <span>{source.title}</span><ExternalLink size={15} aria-hidden="true" />
          </a>
          <p>{source.description}</p>
        </li>)}
      </ul>
    </section>
    <section className="about-section" aria-labelledby="about-ai">
      <h2 id="about-ai">AI declaration</h2>
      <p>Parts of this app were built with the assistance of AI tools. All generated code was reviewed and tested by the project team. More info can be disclosed after request.</p>
    </section>
  </div>
}
