# FishGuesser — agent notes

File and directory names in this repository are **English**. Do not add Polish path names (`licencje`, `podglady`, `plansze.csv`, `etapy/`, …). Product copy stays Polish in `messages/pl.json`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product

- Next.js 16 App Router, React 19, TypeScript `strict` + `noUncheckedIndexedAccess`.
- Look = port of `FishGuesser.html` + `design-tokens.json`. Do not redesign.
- Modes in the shipped game: species, weight, price, mix. **Do not implement map / occurrence guessing.**
- Identity: HttpOnly cookie `fg_uid`. No anonymous Supabase Auth. No `service_role` in `NEXT_PUBLIC_*` or git.
- Database: **remote** Supabase Postgres only. No Docker, no local `supabase start`, no Redis/Upstash/Sentry unless explicitly requested.
- All mutations go through Next.js route handlers (`src/app/api/v1/`). The browser does not write tables.
- Round truth stays on the server until the round closes.
- i18n: `messages/pl.json` + `messages/en.json`. UI strings live there, not in components.
- Dev: `npm run dev` = `next dev --webpack` on `localhost:3000`.

## Do not

- Commit `plan/` (gitignored). Implementation docs stay local.
- Commit secrets (`.env`, service role keys).
- Edit `src/server/fish.ts`, `src/content/**`, or catalog build scripts unless coordinating with the catalog process.
- Scaffold with `create-next-app` in this folder (it would overwrite the prototype).

## Paths

| Path | Role |
|---|---|
| `src/server/game.ts` | Rooms, solo, round lifecycle |
| `src/server/scoring.ts` | Points; weight 0.05–100 kg, price 5–200 PLN |
| `src/components/game/RoomScreen.tsx` | Lobby, round, results, finish |
| `FishGuesser.html` | Visual source of truth for layout |
| `licenses/` | Photo and font licenses |
| `mockups/` | Static PNG screens (gitignored) |
| `plan/stages/` | Local stage notes (gitignored) |
