# FishGuesser — UI/UX specification v1.0

Date: 26 November 2026. Product language: Polish. Audience: 2–12 friends in a shared room, plus a solo player. Platform: browser, mobile-first. This document complements the clickable mockups in `FishGuesser.html`.

## 1. Visual direction

Comic UI with real fish photographs. FishGuesser identity: cream paper, teal, coral and yellow; outline `#111111`. No colour gradients and no blurry shadows. A dotted background imitates paper and halftone. Rectangular content, slightly tilted headings and stickers. Outline 3 px; photographs and modals 4 px. Shadow 5 px right and 5 px down. Radius 6–8 px. Text and outlines use shared tokens.

Palette: `#0B1F3A`, `#14B8C4`, `#FF6B5B`, `#FFD23F`, `#FFF4DC`, `#111111`, `#2FBF71`, `#E5484D`. Extra: day panel `#FFFAF0`, night panel `#163858`, dark secondary text `#514B40`, light secondary `#D3DDDF`. Text on saturated colours is dark. An error message includes an icon or copy, not colour alone.

Fonts: Bangers for slogans, Comic Neue for buttons and speech bubbles, Nunito for longer copy and tabular numbers. Mobile scale: headings 32–72 px, button/bubble 16–22 px, body 14–16 px. Photo credit 10 px, with a way to open a readable full attribution. Desktop: hero 99 px, results up to 105 px. Large scores and timers use `tabular-nums` where the font allows.

Mobile: 390×844, margin 20 px, gutter 12 px, 4 columns. Desktop: 1440×900, margin 60 px, content width up to 1200 px, 12 columns, gutter 24 px. Spacing scale: 4, 8, 12, 16, 20, 24, 32, 48, 64 px. Long forms and results scroll vertically.

## 2. Entry

### Home

Comic wordmark, mascot Captain Szczupak, slogan in a bubble. Primary action “Utwórz pokój”; then “Dołącz do pokoju” and “Graj solo”. Day and Night exist as separate screens and as a toggle. Sound, language and how-to sit under the actions. Desktop adds a round preview with a photograph and a small ranking. The photograph has no overlay text.

### How to play

A four-panel modal: shared photo → four modes → accuracy and time → win after the last round. Buttons Dalej / Zaczynam; dots jump between steps. Escape closes; focus returns to the opener. Closing the how-to does not start a game.

### Profile

Nickname: 3–16 characters after trimming edges, character counter, validate before leaving. Empty or too short blocks Dalej. A taken nick shows a field message and a bubble. Grid of 12 avatars, selected state with a marker, randomise action. Display the nick encoded; never treat it as HTML. In production, uniqueness is confirmed by the server for that room.

### Join

Five tiles A–Z. Paste fills the whole code. Backspace returns to the previous empty field. Join is enabled only with five letters. Link `/room/ABCDE` goes to invite and player profile. Four distinct errors: room not found, full 12/12, game in progress, no connection. Each error screen has one primary action. Retrying a connection error in production keeps the code and profile.

## 3. Lobby

The host sees a large room code, copy, link, player list and settings. Player card: avatar, nick, host crown, online status. The player menu includes kick with a confirmation that names the nick. Cap 12 players. On join: a one-shot “PLUSK!” and a toast.

Pools: Poland, Europe, Europe without Poland. In production the third pool is the difference of species catalogues. Each card has an icon, description and available-fish count. The prototype shows the real demo catalogue size 4/5/1, not invented stock numbers.

Modes: Species, Weight, Price, Occurrence, Mix. Mix rotates questions. In the target product, chips may pick a set of modes; the prototype picks one or Mix. Rounds 5/10/15, time 15/30/45/60 s, difficulty easy/medium/hard/mix. Start is disabled with fewer than two players. A too-small-pool screen blocks Start and explains what to change.

A player sees only a settings summary, the list and waiting for the host; they may leave. An extra “Simulate host start” control is for browsing the prototype and is not in the product. If the host leaves: the oldest active session becomes host; others get a current snapshot and a toast.

## 4. Round

Shared: round number, timer, player place (solo: progress), large photograph in a 4:3 panel, author/licence credit and the answer area. In production `roundId`, `assetId`, question, option set and deadline are identical for the whole room. Truth is revealed only after the round closes.

Countdown has three separate screens 3/2/1 and advances automatically on the play path. Catalogue review can pause on each frame. Short panel motion up to 300 ms. Reduced-motion mode removes transforms and pulsing.

### Species

Four answers: Polish name, smaller Latin in italics. Choosing only highlights; Zatwierdź commits and locks editing. Then a bubble “Odpowiedź zapisana…” and avatars of who answered. In implementation the server does not send other players’ answer content before the round ends.

### Weight

The question is the reference mass of a typical adult specimen, not the photographed fish. Example range 0.001–100 kg. Slider position `p`: `w = 0.001 × 100000^p`, `p ∈ [0, 1]`. The manual field accepts comma or dot. A g/kg switch converts the value. Out-of-range values block submit. Easy difficulty shows a hint in a bubble.

### Price

Price per 1 kg in PLN, range 5–200 zł. Decimal keypad field, +5/+10/+50 buttons capped at 200, linear slider. In the target game the question must state product form (e.g. fresh carcass / fillet), date and market. The reference may be a range. Do not mix fillet prices with whole-fish prices. The current prototype uses labelled sample values only.

### Occurrence

Poland and the Baltic for the Poland pool; Europe otherwise. Real Natural Earth geometry, flat comic styling. Photo collapses to a thumbnail; desktop: photo left, map right. Click/touch places a pin; drag moves it. Enter places, arrows move, +/− zoom. Zatwierdź is enabled only with a pin. Production scoring measures distance to the nearest range point, not an arbitrary capital. The prototype uses a single demo point and a labelled illustrative range.

### Special states

Last five seconds: coral timer, red bar, TIK-TAK label, short vibration if the device supports it and the player allowed it. Time up: 0 points and a clear message. Lost connection: banner with a counter, submit locked. Return: toast and restore of current state. The server rejects answers after the deadline; a repeated request must be idempotent.

## 5. Results and ranking

Photograph, Polish/Latin names, pool, trivia, points and time bonus. Species: correct tile and player picks. Weight/price: reference axis and answers, percent error. Map: range, points and lines to the nearest range edge, distance in km. In the prototype the map graphic is labelled as an example and is not an atlas.

The table lists every player, answers, icons and points. Host has Dalej. A player sees eight seconds and an auto-advance bar. Ranking: place, avatar, nick, total, place change, a clear You row. Variants for 4 and 12 players. At 12, the own row is pinned to the bottom. One-shot “ZOOM!” describes a place change; no animation in reduced motion.

Proposed scoring: species accuracy 1 or 0; weight/price `max(0, 1 − |ln(answer/reference)| / ln 4)`; map `exp(−d / 500)`. Base `800 × accuracy`, bonus `200 × accuracy × remainingTime / limit`. Cap 1000, no answer 0. Untimed games: bonus 0; a separate records table. Ties: sum of accuracy, then sum of times, then a shared place if still equal. The final rule needs a product-owner decision.

## 6. End of game

Podium 1–2–3 with a crown, comic stars and the mascot. Winner variant and lower-place variant. Full ranking is expandable. Stats: best round, mean numeric error, species streak, fastest answer, hardest fish. Unavailable stats in production show “Nie dotyczy”, e.g. no weight questions in that game.

Result-card preview and PNG export 1080×1080. Play again keeps the pool; changing pool returns to the lobby. Exit returns to the start. Game review: photos, names, answer vs truth, score and trivia, filters All / Hits / Misses, and save-for-study. Current end rankings, stats and the five-round list are explicitly labelled demo compositions.

## 7. Solo and settings

Solo: same setup as the lobby plus an untimed option. No multiplayer rank, round progress is visible. Score is stored locally, Top 5 per pool; in implementation split timed/untimed and round count. Missing storage must not block play, but should tell the player the score was not saved.

Settings: Day/Night/auto, SFX volume, music, vibration, PL/EN, reduced motion, nick and avatar edit. In the prototype Polish is complete; EN and audio are labelled placeholders. Separate 404 and full-credits screens. Footer explains that weight and price are approximate.

## 8. Accessibility and behaviour

Primary button ≥52 px; touch target ≥44 px. Focus 4 px, offset 4 px; night focus is yellow with a navy separating ring. Dialogs trap focus and handle Escape, then restore focus. Form controls have labels. Choices use `aria-pressed`; the active how-to step uses `aria-current`. Choice, result and status information include text/icons. Toasts use `role=status`. The timer does not announce every second to a screen reader.

Motion: at most one panel slide per transition, no flicker. System `prefers-reduced-motion` and the in-app switch turn effects off. Photographs must not be filtered, dimmed at night, cropped so that ID features disappear, or covered by the mascot, a caption, a marker or a bubble. The panel stays 4:3; the image inside uses `contain`.

## 9. Product vs backend boundary

For production: rooms and sessions, host authorisation, cap 12, broadcast of questions/deadline, server-side scoring, reconnect, heartbeat, host migration, question catalogue with edited references, asset licences, join-code rate limits and nick moderation. Do not trust host role or points from the client. Do not publish truth before the round ends. Logged data must omit invite tokens and private identifiers. The prototype opens no network connections and does not implement these services.
