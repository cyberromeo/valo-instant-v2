# VALO INSTANT v2 — rebuild plan

Rebuild of cyberromeo/valo-instant (Next.js + Appwrite party finder, Jan 2026) as a new app that also folds in
every feature of ValWiki (cyberromeo.github.io/valwiki) and adds every free Valorant API that works today.

## 1. What the old app had (kept, improved)
- Landing page with Riot ID sign-in (name + tag), rank/level/card looked up through HenrikDev.
- Dashboard: region switch (AP/NA/EU/LATAM/BR/KR), mode tabs (Competitive / Unrated / Swift Play), "How to use" tab.
- Filters: server, mic required, minimum rank, required agent.
- Create Squad modal: mode, region + server, party code, min/max rank, mic required, 5 slots with per-slot
  requirement (any / role / specific agent / locked).
- Lobby cards: host, rank, server, slots with agent/role icons, time ago, COPY CODE, host delete.
- Live updates through Appwrite realtime; lobbies auto-expire; optimistic create; mock lobbies when no DB.
- Agents/roles from valorant-api.com; rank table (Iron 1 → Radiant) with icons.

## 2. What ValWiki has (all brought in)
- Agents: role filter + search, agent page (portrait, lore, role, abilities C/Q/E/X, prev/next).
- Arsenal: weapons by class with cost + fire rate; weapon page with handling stats, damage-by-range table,
  every skin filterable by edition, variants (chromas), upgrade levels, in-game preview video.
- Maps: competitive pool + mode maps; map page with coordinates, minimap with every callout plotted and
  region highlighting.
- Collection: player cards, gun buddies, sprays (animated), titles (tap to copy), currency, seasons timeline
  with live act, ranks from Iron to Radiant.
- Global search (/ or Cmd/Ctrl K) across agents, abilities, weapons, skins, maps, cards, buddies, sprays, titles.
- "Shoot the Blind" Reyna aim trainer: 30-second rounds, best score, streaks, hit markers, touch support.
- Home: featured agent, live patch, current act with days left, map pool rail, quick links. Game modes, bundles.

## 3. New in v2
- Firebase replaces Appwrite: Firestore (lobbies, users) + Firebase Auth (Google + email/password) with
  onSnapshot real-time listeners, security rules and indexes in the repo, emulator config for local dev.
- Riot ID linking on the profile with rank lookup through HenrikDev when a key is configured; a clear
  "rank lookup not connected" state (manual rank pick) when it is not.
- Live server status + planned maintenance per region from Riot's public status feed (no key).
- Esports news feed (vlr.gg RSS) proxied through an API route.
- Bundles, level borders, game modes, contracts/battle-pass and ceremonies from valorant-api.com.
- Mobile-first dark Valorant UI (red #ff4655 accent, teal highlights), bottom tab bar on phone, full titles.

## 4. APIs (verified live on 2026-10-10)
- valorant-api.com v1 (no key): agents, maps (+callouts), weapons (+skins/chromas/levels), competitivetiers,
  gamemodes, playercards, buddies, sprays, playertitles, currencies, contenttiers, seasons, version, bundles,
  contracts, levelborders, ceremonies, events — all 200.
- Riot public status: valorant.secure.dyn.riotcdn.net/channels/public/x/status/{region}.json — 200.
- vlr.gg RSS (https://www.vlr.gg/rss) — 200.
- HenrikDev (api.henrikdev.xyz): every endpoint answers 401 without a key today, so it is optional and
  env-gated (HENRIK_API_KEY) with graceful UI.

## 5. Build order
1. Scaffold Next.js 15 + TS + Tailwind, design system, layout with bottom tabs.
2. Wiki data layer (server-side fetch + cache) and all wiki pages.
3. Firebase: auth, Firestore lobby model, rules, indexes, emulator; party finder UI with live listeners.
4. Status + news + Henrik-gated profile features.
5. Lint + build clean, emulator test, screenshots at 393x852 and 820x1180, fix, push to GitHub, deploy to Vercel.
