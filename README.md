# FishGuesser — mockupy UI/UX i system designu

Otwórz **FishGuesser.html** w aktualnej przeglądarce. Nie wymaga instalacji ani internetu: zdjęcia, geometria mapy i fonty są osadzone w pliku.

## Co zawiera projekt

- 61 plansz i wariantów ze wszystkich sekcji 1–8 briefu.
- Przełączanie formatu: mobile 390×844 i desktop 1440×900. Duże plansze skalują się do dostępnego miejsca; treść wewnątrz planszy można przewijać.
- Klikalna ścieżka: ekran główny → profil → lobby → odliczanie → pytanie → zatwierdzenie → wynik → ranking → kolejna runda → podium.
- Tryby: gatunek, waga, cena i występowanie. Przykładowe dane obejmują pięć gatunków polskich i europejskich.
- Motywy Dzień/Noc, instrukcja, błędy, widoki hosta i gracza, solo, przegląd gry, ustawienia i atrybucje.
- Biblioteka 19 rodzin komponentów, 12 komiksowych awatarów, Kapitan Szczupak w 6 pozach, 10 onomatopei i 16 ikon.
- Klikalny diagram przepływu oraz zasady przekazania projektu.

## Jak przeglądać

Na komputerze wybierz planszę z lewego katalogu. U góry zmienisz wariant i format. Na telefonie katalog zastępuje lista rozwijana. Plansze można otwierać bezpośrednio przez fragment adresu, np. `FishGuesser.html#species`, `#lobby`, `#podium`, `#design`.

Główne ustawienia i wybory działają. Kod przykładowego pokoju: **ABCDE**. Dodatkowe kody do sprawdzania stanów: **FULLL** (pełny), **PLAYY** (gra trwa), **ERROR** (brak serwera). Inny pięcioliterowy kod pokazuje brak pokoju.

„Podziel się wynikiem” pobiera lokalną okładkę PNG. „Zapisz do nauki” i rekordy solo korzystają z pamięci przeglądarki. Pełna dokumentacja UI jest w samym prototypie, w pozycjach „System designu”, „Biblioteka komponentów”, „Przepływ użytkownika” i „Przekazanie i kontrola”.

## Pliki

- **FishGuesser.html** — samodzielny prototyp i komplet dokumentacji wizualnej.
- **FishGuesser-specyfikacja.md** — zachowanie ekranów i kontrakt wdrożeniowy.
- **design-tokens.json** — paleta, typografia, siatka, odstępy i stany.
- **komponenty.csv** — lista komponentów i wariantów, kodowanie UTF-8.
- **plansze.csv** — indeks wszystkich 61 plansz i ich identyfikatorów.
- **przeplyw.mmd** — diagram Mermaid do edycji.
- **raport-kontroli.md** — zakres i wyniki sprawdzenia.
- **FishGuesser-podglad.png** — przegląd pięciu kluczowych plansz mobilnych.
- **podglady/** — 12 osobnych podglądów PNG; mobile 390×844, desktop 1440×900.
- **licencje/** — informacje o zdjęciach, mapie i fontach.

## Zakres prototypu

To projekt UX/UI i lokalna symulacja, bez serwera multiplayer. Pozostali gracze, ich odpowiedzi, ranking i końcowe statystyki są przykładowe. Własne odpowiedzi w rundzie są punktowane lokalnie; ekrany zbiorcze pokazują kompozycję docelowego produktu. Masa referencyjna oznacza przykładowego dorosłego osobnika, a nie pomiar ryby ze zdjęcia. Ceny i zasięgi są demonstracyjne, nie stanowią aktualnego cennika ani atlasu występowania. W katalogu jest pięć fotografii; dłuższa sesja powtarza przykłady.

Wariant EN, ścieżki audio i muzyka wymagają wdrożenia. Kontrolki prezentują ich docelowe miejsce i stany. Link pokoju jest przykładową ścieżką, nie aktywnym zaproszeniem. Oryginalne zdjęcia są osadzone bez filtrów, przycinania i nakładek.
