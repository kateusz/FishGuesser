# Spike Realtime — 2026-11-26

| Pole | Wynik |
|---|---|
| Data | 2026-11-26 |
| Czas propagacji | nie zmierzony |
| RLS dla anon | nie sprawdzone |
| Bloker | Docker nie działa. `docker info` zwraca brak potoku `dockerDesktopLinuxEngine` (silnik nie jest uruchomiony). `npx supabase start` nie został odpalony. |

Próg M0 (< 1 s) zostaje. Architektura bez zmiany: Supabase Realtime jako sygnał, a gdy go nie ma — polling co 2 s w etapie 3. Nie zakładam konta produkcyjnego na skróty.
