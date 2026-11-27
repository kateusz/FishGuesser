# FishGuesser — raport kontroli

Data: 26.11.2026. Środowisko: lokalny Chrome, silnik Chromium, Windows.

## Kompletność plansz

61 nazwanych plansz i wariantów, 122 renderowania (każda plansza w mobile i desktop). Indeks w plansze.csv. Wszystkie sekcje 1–8 briefu mają reprezentację w katalogu lub dokumentacji projektu.

## Kontrola automatyczna

- Składnia JavaScript poprawna, brak błędów wykonania w 122 renderowaniach.
- Brak poziomego przepełnienia w aplikacji i modalach.
- Wszystkie osadzone fotografie wczytane.
- Fotografie: filter:none, object-fit:contain, opacity:1.
- Walidacja nicku: za krótki, zajęty, poprawny; przejście hosta do lobby.
- Wybór i zatwierdzenie odpowiedzi oraz przejście do wyniku.
- Mapa: postawienie i przesunięcie pinezki klawiaturą.
- Cena i waga: liczby z przecinkiem, blokada poza zakresem.
- Modal: otwarcie i zamknięcie Escape.
- Punktacja: trafiony gatunek 1, błędny 0, referencja wagi 1, czterokrotne odchylenie 0.
- Widok strony 390 px bez poziomego przewijania.

Dodatkowy przebieg: pełne pięć rund solo w trybie Miks, przejście do rekordu; błędny gatunek pokazuje 0 pkt i PUDŁO; mapa reaguje na kliknięcie; przełącznik ograniczonego ruchu zmienia stan; testowane ramki fotografii mobile/desktop zachowują 4:3; samodzielny plik otwiera osadzone zdjęcia bez serwera.

## Kontrast kolorów

Obliczenie luminancji względnej sRGB według formuły WCAG; próg 4,5:1 dla zwykłego tekstu.

| Para | Tekst | Tło | Kontrast | Wynik |
|---|---|---|---|---|
| Tekst / papier | #111111 | #FFF4DC | 17.29:1 | AA |
| Tekst / koral | #111111 | #FF6B5B | 6.75:1 | AA |
| Tekst / żółć | #111111 | #FFD23F | 13.08:1 | AA |
| Tekst / turkus | #111111 | #14B8C4 | 7.81:1 | AA |
| Tekst / sukces | #111111 | #2FBF71 | 7.92:1 | AA |
| Tekst / błąd | #111111 | #E5484D | 4.82:1 | AA |
| Noc / panel | #FFF4DC | #163858 | 11.04:1 | AA |
| Noc / tło | #FFF4DC | #0B1F3A | 15.12:1 | AA |
| Wtórny / dzień | #514B40 | #FFF4DC | 7.91:1 | AA |
| Wtórny / noc | #D3DDDF | #163858 | 8.72:1 | AA |

## Kontrola wizualna

Obejrzano zrzuty kluczowych plansz: ekran główny mobile i desktop, runda Gatunek w Dzień i Noc, lobby desktop i podium mobile. Poprawiono wysokość ekranu startowego, tak aby akcje i preferencje były widoczne przy 390×844, oraz podgląd rundy i mini ranking na home desktop. Pozostałe warianty objęto kontrolą renderowania; nie przeprowadzono ręcznego audytu każdej pozycji. Zrzuty eksportowane: siedem mobilnych 390×844 i pięć desktopowych 1440×900.

## Reguły wspólne

Kontur 3 px (4 px fotografia/modal), promień 6–8 px, jeden kierunek cieni +x/+y, główne przyciski min. 52 px. Mniejsze obrysy 2 px są świadomym wariantem dla chipów i elementów wewnętrznych. Tokeny sterują motywami i komponentami we wszystkich planszach. Efekty komiksowe są poza fotografiami. Wyniki korzystają z ikon i etykiet, nie tylko koloru.

## Ograniczenia weryfikacji

To kontrola prototypu, nie certyfikacja pełnej zgodności WCAG. Nie przeprowadzono audytu czytnikiem ekranu ani testów na fizycznym telefonie. Nie ma backendu, prawdziwej synchronizacji multiplayer, katalogu biologicznego, aktualnych cen, ścieżek audio ani tłumaczenia EN. Punkty innych graczy, ranking, przegląd i końcowe statystyki są demonstracyjne. W testach nie oceniano jakości danych rynkowych ani zasięgów gatunków.
