# VALO INSTANT v2

Find a Valorant party in seconds, and read the whole game. A complete rebuild of [valo-instant](https://github.com/cyberromeo/valo-instant) on **Next.js + TypeScript + Tailwind + Firebase**, with every feature of [ValWiki](https://cyberromeo.github.io/valwiki/) folded in. By **SRIHARI**.

## Features

**Party finder** (was Appwrite, now Firestore with live listeners)
- Browse open parties by region (AP / NA / EU / LATAM / BR / KR) and mode (Competitive, Premier, Unrated, Swift Play, Spike Rush, Deathmatch); updates live.
- Filters: server, mic required, minimum rank, open seat for a specific agent.
- Create a party: mode, region + server, party code, min/max rank, mic, a note, and five seats each set to anyone / a role / a specific agent / locked.
- Claim a seat (transaction-safe, no double booking), leave, host closes; parties expire after one hour.
- Copy the party code with one tap and paste it into Valorant's Join Party box.
- Sign in with Google or email (Firebase Auth); profile with Riot ID link, rank, region and "my parties".
- Riot ID rank lookup through HenrikDev when `HENRIK_API_KEY` is set; a clear "not connected" state and manual rank pick when it is not.
- Firestore security rules and composite indexes live in the repo; emulator config for local development.

**Wiki** (all of ValWiki, from valorant-api.com, no key)
- Agents with role filter and search; agent page with portrait, lore, role, abilities C/Q/E/X, same-role agents, previous/next.
- Arsenal by class with cost and fire rate; weapon page with handling gauges, damage-by-range table, and every skin filterable by edition with variants, upgrade levels and in-game preview video.
- Maps: competitive pool and mode maps; map page with coordinates, the minimap with every callout plotted, area highlighting and full screen.
- Ranks Iron to Radiant; player cards, gun buddies, sprays (animated ones play), titles (tap to copy), bundles, currency, seasons timeline with the live act, game modes, level borders.
- Global search (`/` or `Cmd/Ctrl K`) across agents, abilities, weapons, 1,400+ skins, maps, cards, buddies, sprays and titles.
- "Shoot the Blind": Reyna's 30-second aim trainer with saved best score, streaks and touch support.

**Live**
- Server status and planned maintenance for every region from Riot's public status feed.
- Esports headlines from vlr.gg.

## Run it

```sh
npm install
cp .env.example .env.local   # fill in the Firebase web config
npm run dev
```

Without a Firebase config the app still runs: the wiki, status and news work, and the party finder shows sample parties with a "database not connected" notice.

### Local Firebase emulator

```sh
npm run emulators            # needs Java 21+ and firebase-tools
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npm run dev
```

### Deploying rules and indexes

```sh
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules,firestore:indexes
```

## APIs used
- [valorant-api.com](https://valorant-api.com) — agents, maps, weapons, skins, tiers, game modes, cards, buddies, sprays, titles, currencies, content tiers, seasons, version, bundles, level borders.
- Riot public status feed — `valorant.secure.dyn.riotcdn.net/channels/public/x/status/{region}.json`.
- [vlr.gg RSS](https://www.vlr.gg/rss) — esports news.
- [HenrikDev](https://docs.henrikdev.xyz) (optional, key required) — Riot ID account and rank.

---
Not affiliated with Riot Games. VALORANT and all related assets are trademarks of Riot Games, Inc.
