# beans-pesto

**Tail Mates** — a mobile-first web app for finding dog walking buddies, parks and groups.
Built with React + Vite.

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). To try it on your phone, run
`npm run dev -- --host` and open the "Network" URL on a phone connected to the same Wi-Fi.

## Where things live

| Folder            | What's inside                                                        |
| ----------------- | -------------------------------------------------------------------- |
| `src/pages/`      | One file per screen: Home, Map, Social, Profile, Loading, Under Construction |
| `src/components/` | Reusable pieces: header, bottom nav, map, cards, avatars, list rows  |
| `src/hooks/`      | Loading the user's location and the nearby places                    |
| `src/data/`       | The council API (`brisbaneOpenData.js`) and placeholder data (`mockData.js`) |
| `src/index.css`   | Colours, spacing and shared styles                                   |

## Where the map data comes from

Parks and water taps are live from
[Brisbane City Council open data](https://data.brisbane.qld.gov.au/explore/) — no API key
or account needed, and the council allows requests straight from the browser:

- [Dog off-leash areas](https://data.brisbane.qld.gov.au/explore/dataset/park-dog-off-leash-areas/) (172 across Brisbane)
- [Drinking fountain taps](https://data.brisbane.qld.gov.au/explore/dataset/park-drinking-fountain-tap-locations/) (2,099 across Brisbane)

The app asks for the closest places within 3 km of the user and shows the nearest few of
each, since the council's API returns at most 100 records per request. Those limits are
constants at the top of `src/data/brisbaneOpenData.js`.

The map itself is [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles. Locating the user needs an `https://` address in production (`localhost`
works while developing); if location is unavailable the map falls back to the city centre.

Dogs out walking are still placeholder data in `mockData.js`.

Each component has a matching `.css` file next to it. Routes are set up in `src/App.jsx`.
Links to screens that aren't built yet go to `/coming-soon`.
