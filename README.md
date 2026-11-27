# FishGuesser

A mobile-first quiz game: guess European and Polish fish by **species**, **weight**, or **price**. Rooms hold 2–12 players; there is also a solo mode. Product UI language is Polish (`/pl`), with an English skeleton (`/en`).

Play locally at `http://localhost:3000/pl` or on the Vercel preview for branch `etap-0-fundamenty`.

## Run

```bash
npm install
npm run dev
```

Dev server: **webpack** (`next dev --webpack`) on **port 3000**. Use `http://localhost:3000`, not `127.0.0.1`, so HMR stays attached.

Other scripts: `npm run build`, `npm run typecheck`, `npm test` (unit tests for scoring and catalog only).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4, CSS variables from `design-tokens.json`
- Remote **Supabase Postgres** (EU). All DB access is server-side with the service role. Identity is an HttpOnly cookie `fg_uid` — no anonymous Supabase Auth.
- Hosting: Vercel region `fra1`

## Environment

Copy `.env.example`. Secrets never go in the repo or in `NEXT_PUBLIC_*`.

| Variable | Role |
|---|---|
| `SUPABASE_URL` | Project URL (optional locally; code has a default public URL) |
| `SUPABASE_SECRET_KEY` or `SUPABASE_API_KEY` | Service role, server only |
| `CRON_SECRET` | Protects `/api/cron/cleanup` |
| `NEXT_PUBLIC_APP_URL` | Public origin when needed |

On Windows, local dev can also read `SUPABASE_API_KEY` from the user environment.

Apply `supabase/schema.sql` on the remote project. Do not use Docker or the Supabase CLI for this app.

## App routes

| Path | Screen |
|---|---|
| `/pl` | Home |
| `/pl/profile` | Nickname + avatar, then host/join/solo |
| `/pl/join` | Five-letter room code |
| `/pl/room/[code]` | Lobby, round, results, ranking, finish |
| `/pl/solo` · `/pl/solo/[id]` | Solo setup and play |
| `/pl/settings` | Theme, sound, reduced motion, credits, privacy |
| `/api/v1/...` | Game API (rooms, answers, assets) |

A second player needs a second browser (or a private window): one tab = one `fg_uid`. Mix mode is species, weight, and price only — **no map / occurrence guessing**.

## Prototype (visual source)

Open `FishGuesser.html` in a browser (no install). It is the mockup studio, not the live game.

| File | What it is |
|---|---|
| `FishGuesser.html` | Self-contained UI prototype |
| `FishGuesser-specification.md` | Screen behaviour / implementation contract |
| `design-tokens.json` | Palette, type, grid |
| `components.csv` | Component inventory |
| `screens.csv` | 61 screen IDs |
| `flow.mmd` | Mermaid flow |
| `control-report.md` | Prototype QA notes |
| `FishGuesser-preview.png` | Mobile overview |
| `mockups/` | PNG stills (390×844 and 1440×900) |
| `licenses/` | Photo, map, and font licenses |

## Layout

```
src/app/          App Router (pages + API)
src/components/   Home, room, solo, settings
src/server/       Game engine, scoring, catalog, Supabase
src/content/      fish-catalog.json + photos
src/fonts/        Bangers, Comic Neue, Nunito (OFL)
messages/         pl.json, en.json
tests/unit/       Scoring and catalog tests
```

`plan/` is local implementation notes only — **never commit it**.

## Catalog

Another process may expand `src/content/` and photo credits. Coordinate before editing `src/server/fish.ts`, catalog JSON, or photos.
