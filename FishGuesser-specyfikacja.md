# FishGuesser — specyfikacja UI/UX v1.0

Data: 26 listopada 2026. Język produktu: polski. Grupa: 2–12 znajomych we wspólnym pokoju oraz gracz solo. Platforma: przeglądarka, mobile-first. Dokument uzupełnia klikalne mockupy w FishGuesser.html.

## 1. Kierunek wizualny

Komiksowe UI z prawdziwymi fotografiami ryb. Własna tożsamość FishGuesser: kremowy papier, turkus, koral i żółć; kontur #111111. Brak gradientów kolorystycznych i rozmytych cieni. Wzór punktowy w tle imituje papier i półtony. Prostokątne treści, delikatnie pochylone nagłówki i naklejki. Kontur 3 px, fotografie i modale 4 px. Cień 5 px w prawo i 5 px w dół. Promień 6–8 px. Teksty i kontury korzystają ze wspólnych tokenów.

Paleta: #0B1F3A, #14B8C4, #FF6B5B, #FFD23F, #FFF4DC, #111111, #2FBF71, #E5484D. Dodatkowo: panel dzienny #FFFAF0, panel nocny #163858, ciemny tekst wtórny #514B40 i jasny wtórny #D3DDDF. Tekst na nasyconych kolorach jest ciemny; komunikat błędu zawiera ikonę lub treść, nie tylko barwę.

Fonty: Bangers do haseł, Comic Neue do przycisków i dymków, Nunito do dłuższej treści i liczb tabelarycznych. Skala mobilna 32–72 px w nagłówkach, 16–22 px przycisk/dymek, 14–16 px tekst. Podpis zdjęcia 10 px z możliwością otwarcia czytelnej pełnej atrybucji. Desktop: hero 99 px, wyniki do 105 px. Duży wynik i czas używają tabular-nums tam, gdzie pozwala na to font.

Mobile: 390×844, margines 20 px, gutter 12 px, 4 kolumny. Desktop: 1440×900, margines 60 px, szerokość treści do 1200 px, 12 kolumn, gutter 24 px. Skala odstępów: 4, 8, 12, 16, 20, 24, 32, 48, 64 px. Długie formularze i wyniki przewijają się w pionie.

## 2. Wejście

### Ekran główny

Komiksowy logotyp, maskotka Kapitan Szczupak, slogan w dymku. Główna akcja „Utwórz pokój”; dalej „Dołącz do pokoju” i „Graj solo”. Dzień i Noc dostępne jako osobne plansze oraz przełącznik. Preferencje dźwięku, języka i instrukcja pod akcjami. Desktop dodaje podgląd rundy z fotografią i małym rankingiem. Fotografia nie zawiera nałożonych napisów.

### Instrukcja

Modal czterech paneli: wspólne zdjęcie → cztery tryby → dokładność i czas → zwycięstwo po ostatniej rundzie. Przyciski Dalej/Zaczynam; kropki nawigują między krokami. Escape zamyka, focus wraca do przycisku otwierającego. Zamknięcie instrukcji nie rozpoczyna gry automatycznie.

### Profil

Nick: 3–16 znaków po usunięciu skrajnych spacji, licznik znaków, walidacja przed przejściem. Pusty lub zbyt krótki blokuje Dalej. Zajęty nick pokazuje komunikat przy polu i dymek. Siatka 12 awatarów, stan wybrany ze znacznikiem, akcja losowania. Nick jest kodowany przy wyświetlaniu; nie interpretować go jako HTML. W produkcji unikalność musi potwierdzić serwer danego pokoju.

### Dołączanie

Pięć kafelków A–Z. Wklejenie uzupełnia cały kod. Backspace wraca do poprzedniego pustego pola. Dołącz aktywne dopiero przy pięciu literach. Link /room/ABCDE prowadzi do zaproszenia i profilu gracza. Cztery osobne błędy: nieistniejący pokój, pełny 12/12, gra w toku, brak połączenia. Każda plansza błędu ma jedną główną akcję. Ponowienie błędu połączenia w produkcji zachowuje kod i profil.

## 3. Lobby

Host widzi wielki kod pokoju, kopiowanie, link, listę graczy i ustawienia. Karta gracza: awatar, nick, korona hosta, status online. Menu gracza zawiera usunięcie z potwierdzeniem wskazującym nick. Licznik maksymalnie 12 graczy. Wejście gracza: jednorazowy „PLUSK!” i toast.

Pule: Polska, Europa, Europa bez Polski. W produkcji trzecia pula to różnica katalogów gatunków. Każda karta zawiera ikonę, opis i liczbę dostępnych ryb. W prototypie pokazano rzeczywisty rozmiar katalogu demo 4/5/1, zamiast wymyślonych liczb zasobów.

Tryby: Gatunek, Waga, Cena, Występowanie, Miks. Miks rotuje pytania. W docelowej implementacji chipy mogą wybierać zestaw trybów; prototyp wybiera jeden lub Miks. Rundy 5/10/15, czas 15/30/45/60 s, trudność łatwa/średnia/trudna/miks. Start nieaktywny przy mniej niż dwóch graczach. Plansza za małej puli blokuje Start i wyjaśnia, co zmienić.

Gracz widzi tylko podsumowanie ustawień, listę i czekanie na hosta; może opuścić pokój. Dodatkowy przycisk „Symuluj start przez hosta” służy przeglądaniu prototypu i nie należy do produktu. Host odchodzi: najstarsza aktywna sesja dostaje rolę, pozostali otrzymują aktualny snapshot i toast.

## 4. Runda

Wspólne: numer rundy, czas, miejsce gracza (w solo postęp), duża fotografia w panelu 4:3, podpis autor/licencja i obszar odpowiedzi. W produkcji roundId, assetId, pytanie, zestaw odpowiedzi i deadline są identyczne dla całego pokoju. Prawda jest ujawniana dopiero po zamknięciu rundy.

Odliczanie ma trzy osobne plansze 3/2/1 i przechodzi automatycznie w ścieżce gry. Przegląd katalogu pozwala zatrzymać się na każdej klatce. Krótki ruch panelu do 300 ms. Tryb zmniejszonych animacji usuwa transformacje i pulsowanie.

### Gatunek

Cztery odpowiedzi: nazwa polska, mniejsza łacińska kursywą. Wybór jedynie zaznacza; Zatwierdź zapisuje i blokuje edycję. Później dymek „Odpowiedź zapisana…” i awatary odpowiadających. W implementacji serwer nie wysyła treści cudzych odpowiedzi przed końcem rundy.

### Waga

Pytanie dotyczy masy referencyjnej typowego dorosłego osobnika, nie rzeczywistej masy fotografowanego obiektu. Zakres przykładowy 0,001–100 kg. Pozycja suwaka p: w=0,001×100000^p, p∈[0,1]. Pole ręczne przyjmuje przecinek lub kropkę. Przełącznik g/kg konwertuje wartość. Wartości poza zakresem blokują zatwierdzenie. Na łatwym poziomie wskazówka w dymku.

### Cena

Cena za 1 kg w PLN, zakres 5–200 zł. Pole z klawiaturą dziesiętną, przyciski +5/+10/+50 z ograniczeniem do 200, suwak liniowy. W docelowej grze pytanie musi podać postać produktu, np. tusza świeża / filet, datę i rynek. Referencja może być przedziałem. Nie mieszać cen fileta z ceną całej ryby. Aktualny prototyp używa wyłącznie oznaczonych wartości przykładowych.

### Występowanie

Polska i Bałtyk dla puli Polska; Europa dla pozostałych. Prawdziwa geometria z Natural Earth, styl płaskiego komiksu. Zdjęcie zwijane do miniatury; desktop zdjęcie po lewej, mapa po prawej. Klik/dotyk stawia pinezkę, przeciąganie przesuwa. Enter stawia, strzałki zmieniają lokalizację; +/− zmieniają zoom. Zatwierdź aktywne dopiero z pinezką. Punktowanie w produkcji mierzy odległość do najbliższego punktu zasięgu, nie arbitralnej stolicy. Prototyp używa pojedynczego punktu demo i oznaczonego ilustracyjnego zasięgu.

### Stany specjalne

Ostatnie pięć sekund: koralowy licznik, czerwony pasek, etykieta TIK-TAK, krótka wibracja, jeśli wspiera ją urządzenie i gracz zezwolił. Czas minął: 0 pkt i jasny komunikat. Utrata połączenia: baner z licznikiem, blokada zatwierdzenia. Powrót: toast i odtworzenie bieżącego stanu. Serwer nie przyjmuje odpowiedzi po deadline; powtórzony request ma być idempotentny.

## 5. Wyniki i ranking

Fotografia, nazwy polska/łacińska, pula, ciekawostka, liczba punktów i bonus czasu. Gatunek: poprawny kafelek oraz wybory graczy. Waga/cena: oś referencji i odpowiedzi, błąd procentowy. Mapa: zasięg, punkty i linie do najbliższej granicy zasięgu, odległość w km. W prototypie grafika mapy jest oznaczona jako przykład i nie stanowi atlasu.

Tabela zawiera wszystkich graczy, odpowiedzi, ikony i punkty. Host ma Dalej. Gracz widzi osiem sekund i pasek automatycznego przejścia. Ranking: pozycja, awatar, nick, suma, zmiana pozycji, wyraźny wiersz Ty. Wariant 4 i 12 graczy. Przy 12 własny wiersz przyklejony do dołu. Jednorazowe „ZOOM!” opisuje zmianę kolejności; bez animacji w trybie ograniczonego ruchu.

Proponowana punktacja: trafność gatunku 1 lub 0; waga/cena max(0,1−|ln(odpowiedź/referencja)|/ln4); mapa exp(−d/500). Baza 800×trafność, bonus 200×trafność×pozostałyCzas/limit. Maksimum 1000, brak odpowiedzi 0. W grze bez limitu bonus 0; osobna tabela rekordów. Remis: suma dokładności, następnie suma czasów, a przy pełnej równości wspólne miejsce. Ostateczna reguła wymaga decyzji właściciela produktu.

## 6. Koniec gry

Podium 1–2–3 z koroną, komiksowymi gwiazdami i maskotką. Wariant zwycięzcy i niższego miejsca. Pełny ranking rozwijany. Statystyki: najlepsza runda, średni błąd liczbowy, seria gatunków, najszybsza odpowiedź, najtrudniejsza ryba. Niedostępne statystyki w produkcji mają „Nie dotyczy”, np. brak pytań o wagę w danej grze.

Podgląd okładki wyniku i eksport PNG 1080×1080. Zagraj ponownie zachowuje pulę; zmiana puli wraca do lobby. Wyjście wraca na początek. Przegląd gry: fotografie, nazwy, odpowiedź vs prawda, wynik i ciekawostka, filtry Wszystkie/Trafione/Pudła oraz zapis do nauki. Obecne końcowe rankingi, statystyki i lista pięciu rund to jawnie oznaczone kompozycje demonstracyjne.

## 7. Solo i ustawienia

Solo: konfiguracja jak lobby plus opcja bez limitu. Brak miejsca w rankingu multiplayer, widoczny postęp rund. Wynik zapisuje się lokalnie, Top 5 według puli; w implementacji rozdzielić tryb czasowy/bez limitu i liczbę rund. Brak dostępu do pamięci nie blokuje gry, lecz powinien pokazać informację o niezapisaniu.

Ustawienia: Dzień/Noc/auto, głośność efektów, muzyka, wibracje, PL/EN, zmniejszone animacje, edycja nicku i awatara. W prototypie polski jest kompletnym językiem, EN i audio są oznaczonymi miejscami do wdrożenia. Odrębne plansze 404 i pełnych atrybucji. Stopka wyjaśnia przybliżony charakter wagi i ceny.

## 8. Dostępność i zachowanie

Przycisk główny ≥52 px; akcja dotykowa ≥44 px. Focus 4 px, odstęp 4 px; nocny focus w żółci z granatowym separującym pierścieniem. Dialog utrzymuje focus i obsługuje Escape, po zamknięciu przywraca focus. Form controls mają etykiety. Wybory mają aria-pressed; aktywny krok instrukcji ma aria-current. Informacje o wyborze, wyniku i statusie zawierają tekst/ikony. Toasty mają role=status. Timer nie ogłasza każdej sekundy czytnikowi.

Ruch: maksymalnie jedno wsunięcie panelu na przejście, bez migotania. Systemowe prefers-reduced-motion i przełącznik produktu wyłączają efekty. Fotografii nie wolno filtrować, przyciemniać nocą, kadrować tak, by ukryć cechy rozpoznawcze, ani zasłaniać maskotką, napisem, znacznikiem czy dymkiem. Panel zachowuje 4:3; obraz wewnątrz contain.

## 9. Granica projektu i backendu

Do implementacji produkcyjnej: pokoje i sesje, autoryzacja hosta, limit 12, broadcast pytań/deadline, serwerowe punktowanie, reconnect, heartbeat, migracja hosta, katalog pytań z redakcją referencji, licencje zasobów, limity prób kodów i moderacja nicków. Nie ufaj roli hosta ani punktom z klienta. Nie publikuj prawdy przed końcem rundy. Dane logowane bez tokenów zaproszeń i identyfikatorów prywatnych. Prototyp nie otwiera połączeń sieciowych i nie implementuje tych usług.
