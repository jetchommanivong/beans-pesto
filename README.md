# beans-pesto

**Tail Mates** - a mobile-first web app for finding dog walking buddies, parks and groups.
Built with React + Vite.

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). To try it on your phone, run
`npm run dev -- --host` and open the "Network" URL on a phone connected to the same Wi-Fi.

## Where things live

| Folder            | What's inside                                                                |
| ----------------- | ---------------------------------------------------------------------------- |
| `src/pages/`      | One file per screen: Home, Map, Social, Profile, Loading, Under Construction |
| `src/components/` | Reusable pieces: header, bottom nav, map, cards, avatars, list rows          |
| `src/hooks/`      | Loading the user's location and the nearby places                            |
| `src/data/`       | The council API (`brisbaneOpenData.js`) and placeholder data (`mockData.js`) |
| `src/index.css`   | Colours, spacing and shared styles                                           |

## Where the map data comes from

Parks and water taps are live from
[Brisbane City Council open data](https://data.brisbane.qld.gov.au/explore/) - no API key
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

## Recording and sharing walks

Home's **Start a walk** opens a dedicated route map and asks the browser for
precise location. Use HTTPS or localhost, allow location access, and keep the
app visible with the screen awake. This is a browser recorder, so it pauses
when the app goes into the background. It does not track with the screen locked.
Where supported, a screen wake lock keeps the display on during recording and
is released when recording stops or pauses.

You can pause, resume, finish, or discard a recording. GPS fixes with accuracy
worse than 75 metres and implausible jumps are ignored; pauses and long gaps
are separate route segments. Distances are estimates from the accepted GPS
fixes. An unfinished route is saved as you walk and recovered **paused** after
a refresh, without adding time while the app was closed.

On finishing, choose **Private** (the default) or **Followers**. Your profile's
walk history opens each route on its map, and **Preview follower view** shows
only follower-visible walks. You can change visibility or delete a saved walk.
Sharing a route in a DM or group chat grants that conversation access while
keeping a private walk out of the profile's follower view. **Stop sharing in
chats** revokes those route links; deleting a walk also removes access from
previously shared messages. Chat messages reference the walk rather than
embedding copies of its coordinates.

This remains a local prototype: recordings, follower visibility, and chat
shares live in this browser's storage. They are not sent to real accounts or
other devices, and profile previews are not server-enforced access control.
Storage errors are surfaced before claiming a walk was saved or shared.

Run `npm test` for the walk lifecycle, GPS filtering, recovery, privacy, route
sharing, and existing social checks. Device GPS and map interactions still
need a browser/phone check.

## Deploying to the team web space

```bash
npm install
npm run build
```

That creates a `dist/` folder (about 460 KB). **Upload the contents of `dist/`** —
`index.html`, `assets/` and `favicon.svg` — into your folder on the web space. Don't
upload `src/` or `node_modules/`; they aren't needed to run the app.

Then open the folder's URL. That's the whole deployment: the app is static files, with
no server code, database or API key to configure.

Two settings make this work on any web space, no matter which folder it lands in:

- `base: './'` in `vite.config.js` makes the built files link to each other relatively,
  so the app runs at a domain root or at `/teams/beans-pesto/` without changes.
- The app uses `HashRouter`, so screens are addressed as `.../index.html#/map`. The
  server only ever serves one file, which means no `.htaccess`, mod_rewrite or
  URL-rewriting rules are needed, and refreshing or sharing a deep link works.

Notes:

- **Location needs `https://`.** Browsers only share the user's position on a secure
  address. On a plain `http://` page the app still works — the map just falls back to
  central Brisbane and says so.
- **Re-deploying** means running `npm run build` again and re-uploading `dist/`. The
  file names inside `assets/` change each build, so browsers pick up new versions
  automatically; delete the old `assets/` files if you want to keep the folder tidy.
- The app calls the council API and OpenStreetMap directly from the visitor's browser,
  so the web space doesn't need outbound internet access itself.
