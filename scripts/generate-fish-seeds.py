#!/usr/bin/env python3
"""Generuje scripts/fish-species-seeds.json (205 gatunków: 5 demo + 200 nowych)."""

from __future__ import annotations

import json
import sys
from pathlib import Path

from fish_seeds_lib import row

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
from fish_species_extra import EXTRA_SPECIES  # noqa: E402

OUT = Path(__file__).with_name("fish-species-seeds.json")


LEGACY = [
    row(
        "pike",
        "Szczupak pospolity",
        "Esox lucius",
        "Szczupakowate",
        "PL,EU",
        2.4,
        45,
        "tusza świeża",
        "Duża ryba drapieżna.",
        "Płetwa grzbietowa szczupaka leży blisko ogona.",
        "PL: native w rzekach, jeziorach i przybrzeżu Bałtyku.",
    ),
    row(
        "perch",
        "Okoń europejski",
        "Perca fluviatilis",
        "Okoniowate",
        "PL,EU",
        0.8,
        39,
        "tusza świeża",
        "Nieduża ryba z pasami.",
        "Okoń ma pionowe pasy i kolczastą płetwę grzbietową.",
        "PL: pospolity w wodach śródlądowych.",
    ),
    row(
        "cod",
        "Dorsz atlantycki",
        "Gadus morhua",
        "Dorszowate",
        "PL,EU",
        4.0,
        55,
        "tusza świeża",
        "Ryba morska, zwykle kilka kilogramów.",
        "Dorsz ma wąsik pod dolną szczęką i trzy płetwy grzbietowe.",
        "PL: poławiany na Bałtyku.",
    ),
    row(
        "bream",
        "Dorada",
        "Sparus aurata",
        "Prażmowate",
        "EU",
        1.0,
        49,
        "tusza świeża",
        "Ryba około kilograma.",
        "Złoty pas między oczami jest cechą dorady.",
        "EU: typowa ryba śródziemnomorska, bez naturalnego zasięgu w PL.",
    ),
    row(
        "salmon",
        "Łosoś atlantycki",
        "Salmo salar",
        "Łososiowate",
        "PL,EU",
        5.0,
        79,
        "filet",
        "Duża ryba wędrowna.",
        "Łosoś atlantycki wędruje między rzeką a morzem.",
        "PL: Bałtyk i rzeki zarybieniowe.",
    ),
]


def seeds() -> list[dict]:
    # Źródła: atlasy ichtiofauny PL/Bałtyk + szeroki katalog rynku UE (Morze Północne, Atlantyk, Śródziemne).
    pl: list[dict] = [
        row("zander", "Sandacz", "Sander lucioperca", "Łopieniowate", "PL,EU", 2.5, 58, "filet", "Drapieżnik o wydłużonym kształcie.", "Ma szczękę pełną ostrych zębów.", "PL: jeziora, rzeki i zalewy."),
        row("wels", "Sum europejski", "Silurus glanis", "Sumowate", "PL,EU", 8.0, 42, "tusza świeża", "Bardzo duża ryba drapieżna.", "Sum może dorastać do ponad 2 m.", "PL: duże rzeki nizinne."),
        row("abramis-brama", "Leszcz", "Abramis brama", "Karpiowate", "PL,EU", 1.6, 28, "tusza świeża", "Karłowaty kształt i wysokie ciało.", "Leszcz ma wysoki profil i ciemny grzbiet.", "PL: pospolity w jeziorach i starorzeczach."),
        row("roach", "Płoć", "Rutilus rutilus", "Karpiowate", "PL,EU", 0.35, 22, "tusza świeża", "Niewielka ryba stadna.", "Płetwa ogonowa ma czerwonawy brzeg.", "PL: praktycznie wszystkie wody śródląndskie."),
        row("tench", "Lin", "Tinca tinca", "Karpiowate", "PL,EU", 1.2, 32, "tusza świeża", "Okrągłe, śluziste ciało.", "Lin ma drobne łuski w tłustej skórze.", "PL: jeziora z roślinnością."),
        row("crucian", "Karaś pospolity", "Carassius carassius", "Karpiowate", "PL,EU", 0.45, 24, "tusza świeża", "Masywne, wysokie ciało.", "Karaś dobrze znosi gorą i słabą tlenowość.", "PL: płytkie zarośnięte zbiorniki."),
        row("gibel-carp", "Karaś srebrzysty", "Carassius gibelio", "Karpiowate", "PL,EU", 0.5, 20, "tusza świeża", "Srebrzyste boki.", "Forma aseksualna bywa dominująca w populacji.", "PL: inwazyjny, bardzo pospolity."),
        row("common-carp", "Karp zwykły", "Cyprinus carpio", "Karpiowate", "PL,EU", 3.5, 35, "tusza świeża", "Duża ryba karpiowata.", "Karp domowy pochodzi z formy dzikiej.", "PL: gatunek rodzimy i hodowlany."),
        row("european-eel", "Węgorz europejski", "Anguilla anguilla", "Węgorzowate", "PL,EU", 1.0, 65, "tusza świeża", "Wydłużone, wężowate ciało.", "Wędruje do Morza Sargassowego na tarło.", "PL: rzeki i Bałtyk."),
        row("chub", "Jaź", "Squalius cephalus", "Karpiowate", "PL,EU", 1.0, 26, "tusza świeża", "Smukłe, srebrzyste ciało.", "Jaź poluje także na powierzchni.", "PL: rzeki środkowej Europy."),
        row("ide", "Jaź garbaty", "Leuciscus idus", "Karpiowate", "PL,EU", 1.3, 27, "tusza świeża", "Smukła ryba rzeczna.", "Potrafi skubać liście przy brzegu.", "PL: większe rzeki."),
        row("dace", "Jelec europejski", "Leuciscus leuciscus", "Karpiowate", "PL,EU", 0.25, 18, "tusza świeża", "Drobna ryba rzeczna.", "Jelec lubi wartki nurt i czystą wodę w rzekach.", "PL: częsty w czystych rzekach."),
        row("bleak", "Ukleja", "Alburnus alburnus", "Karpiowate", "PL,EU", 0.08, 14, "tusza świeża", "Bardzo mała, stadna ryba.", "Ukleja żyje blisko powierzchni.", "PL: pospolita w siedmiu i rzekach."),
        row("vimba", "Vimba", "Vimba vimba", "Karpiowate", "PL,EU", 0.35, 22, "tusza świeża", "Smukła ryba o srebrzystych bokach.", "W sezonie tarła ma żółte płetwy.", "PL: Wisła i Odra."),
        row("asp", "Boleń", "Aspius aspius", "Karpiowate", "PL,EU", 2.0, 34, "tusza świeża", "Smukły drapieżny karpiowaty.", "Poluje na stadach drobnych ryb.", "PL: większe rzeki nizinne."),
        row("rudd", "Wzdręga", "Scardinius erythrophthalmus", "Karpiowate", "PL,EU", 0.3, 21, "tusza świeża", "Płetwy mają czerwonawy odcień.", "Czerwone oko jest charakterystyczne.", "PL: starorzecza i płytkie zbiorniki."),
        row("white-bream", "Karaś bystry", "Blicca bjoerkna", "Karpiowate", "PL,EU", 0.2, 19, "tusza świeża", "Mniejszy od leszcza.", "Ma wyraźną czarną plamę u podstawy płetwy.", "PL: wody spokojne."),
        row("burbot", "Miętus", "Lota lota", "Sędziukowate", "PL,EU", 1.5, 36, "tusza świeża", "Ryba drapieżna o jednej wąsce.", "Jedyny przedstawiciel dorszowatych w PL.", "PL: chłodne jeziora i rzeki."),
        row("bullhead", "Głowacica", "Cottus gobio", "Głowacicowate", "PL,EU", 0.08, 16, "tusza świeża", "Bardzo mała ryba przy dnie.", "Ma szeroką głowę i płetwy piersiowe.", "PL: górskie i śródziemnomorze rzek."),
        row("brown-trout", "Pstrąg potokowy", "Salmo trutta fario", "Łososiowate", "PL,EU", 1.2, 72, "filet", "Smukły łosośowiec z plamkami.", "Forma potokowa bywa barwniejsza.", "PL: górskie i nizinne rzeki."),
        row("grayling", "Lipień", "Thymallus thymallus", "Łososiowate", "PL,EU", 0.6, 54, "filet", "Wysoka płetwa grzbietowa.", "Lipień lubi czystą, chłodną wodę.", "PL: Podhale i Sudety."),
        row("whitefish", "Sielawa", "Coregonus albula", "Łososiowate", "PL,EU", 0.25, 48, "tusza świeża", "Ryba pelagiczna jezior.", "Ma małą głowę i srebrzyste ciało.", "PL: jeziora pojezierzy."),
        row("vendace", "Sielawa bałtycka", "Coregonus maraena", "Łososiowate", "PL,EU", 0.2, 46, "tusza świeża", "Drobna ryba morska.", "Poławiana w delcie Wisły.", "PL: wód bałtyckich."),
        row("rainbow-trout", "Pstrąg tęczowy", "Oncorhynchus mykiss", "Łososiowate", "PL,EU", 1.5, 58, "filet", "Ozdobna różowa smuga boku.", "Hodowlany, szeroko zarybieniowy.", "PL: gospodarka rybacka i zarybienia."),
        row("brook-trout", "Pstrąg źródlany", "Salvelinus fontinalis", "Łososiowate", "PL,EU", 0.5, 62, "filet", "Niewielki łosośowiec.", "Białe obrzeżenia płetw.", "PL: zarybienia w wodach górskich."),
        row("arctic-char", "Golec", "Salvelinus alpinus", "Łososiowate", "EU", 1.0, 70, "filet", "Ryba arktyczna.", "W ciemnej wodzie robi się srebrzysty.", "EU: Skandynawia i Alpy; w PL tylko introdukcje."),
        row("huchen", "Głowacica dunajska", "Hucho hucho", "Łososiowate", "EU", 5.0, 95, "filet", "Duży łosośowiec.", "Największy drapieżnik w rzece Dunaj.", "EU: górny Dunaj; poza naturalnym zasięgiem w PL."),
        row("sturgeon-russian", "Jesiotr rosyjski", "Acipenser gueldenstaedtii", "Jesiotrowate", "EU", 8.0, 180, "ikra", "Potężna ryba rzeczna.", "Ikra jesiotra jest luksusowym produktem.", "EU: Morze Czarne; w PL hodowle."),
        row("sterlet", "Siewiuga", "Acipenser ruthenus", "Jesiotrowate", "PL,EU", 2.0, 120, "ikra", "Najmniejszy jesiotr.", "Ma wysoki grzbiet.", "PL: rzadki, reintrodukcje i hodowle."),
        row("starlet", "Siewiórka", "Acipenser stellatus", "Jesiotrowate", "EU", 4.0, 150, "ikra", "Wydłużony pyszczek.", "Łowiony historycznie w Dunaju.", "EU: Morze Czarne i Kaspii; bez populacji PL."),
        row("wels-head", "Sum afrykański", "Clarias gariepinus", "Clariidae", "EU", 3.0, 38, "filet", "Sumowaty o długich wąsach.", "Hodowlany w recyrkulacji.", "EU: hodowle; nie występuje w PL na wolności."),
        row("pumpkinseed", "Krasnopiór", "Lepomis gibbosus", "Okoniowate", "PL,EU", 0.15, 15, "tusza świeża (rzadko)", "Mały słońc karpiowy.", "W PL często inwazyjny.", "PL: introdukcja w wodach ciepłych."),
        row("bluegill", "Słonecznica", "Lepomis macrochirus", "Okoniowate", "EU", 0.12, 15, "tusza świeża (rzadko)", "Mały okoniowiec.", "Charakterystyczna plama ucha.", "EU: introdukcje; w PL wystąpienia egzotyczne."),
        row("ruffe", "Jazgarz", "Gymnocephalus cernua", "Okoniowate", "PL,EU", 0.12, 17, "tusza świeża", "Płetwy kolczaste.", "Jazgarz ma kolczaste płetwy i nie lubi jasnego światła.", "PL: jeziora i Bałtyk."),
        row("pope", "Jazgarz czarny", "Gymnocephalus baloni", "Okoniowate", "PL,EU", 0.1, 17, "tusza świeża", "Blisko spokrewniony z jazgarzem.", "Samiec ma czerwonawo purpurowy brzuch w okresie godowym.", "PL: Wisła i dolne Odra."),
        row("stickleback", "Ciernik", "Gasterosteus aculeatus", "Ciernikowate", "PL,EU", 0.004, 0, "—", "Bardzo mała ryba.", "Buduje gniazdo ze stróża.", "PL: brzegi morza i słonawych wód."),
        row("ninespine", "Kolcica", "Pungitius pungitius", "Kolcicowate", "PL,EU", 0.003, 0, "—", "Miniaturowa ryba.", "Dziewięć kolców grzbietowych.", "PL: Bałtyk i laguny."),
        row("weatherfish", "Piskorz", "Misgurnus fossilis", "Piskorzowate", "PL,EU", 0.1, 20, "tusza świeża", "Wąskie wężowate ciało.", "Żyje w mulistym dnie.", "PL: starorzecza i odnogi."),
        row("spined-loach", "Kirys", "Cobitis taenia", "Kirysowate", "PL,EU", 0.05, 0, "—", "Drobna ryba denna.", "Kolce pod oczami.", "PL: piaszczyste brzegi."),
        row("bitterling", "Różanka", "Rhodeus amarus", "Karpiowate", "PL,EU", 0.06, 0, "—", "Malutka ryba.", "Ikra rozwija się w małży.", "PL: wody nizinne."),
    ]

    pl_more: list[dict] = [
        row("barbel", "Brzanka", "Barbus barbus", "Karpiowate", "PL,EU", 2.0, 30, "tusza świeża", "Cylindryczne ciało z wąsami.", "Silny nurtowiec.", "PL: górne Odra i Wisła."),
        row("nase", "Certa", "Chondrostoma nasus", "Karpiowate", "PL,EU", 0.8, 25, "tusza świeża", "Tępo zakończony pysk.", "Zgryza glony ze skał.", "PL: Wisła i Odra."),
        row("vimba-bream", "Płoćnica", "Abramis ballerus", "Karpiowate", "PL,EU", 0.5, 23, "tusza świeża", "Węższe ciało niż leszcz.", "Wyższy korpus niż u płoci.", "PL: pospolity w Wisłą i Odra."),
        row("zope", "Tęcza", "Ballerus sapa", "Karpiowate", "PL,EU", 0.45, 22, "tusza świeża", "Podobna do płoćnicy.", "Długie oczy sterczą ku górze.", "PL: główne rzeki."),
        row("prussian-carp", "Karaś oczkowany", "Carassius auratus gibelio", "Karpiowate", "PL,EU", 0.4, 19, "tusza świeża", "Małe ryby stadne.", "Często mylony z karaśniem.", "PL: pospolity inwazyjny."),
        row("grass-carp", "Amur", "Ctenopharyngodon idella", "Karpiowate", "PL,EU", 4.0, 32, "tusza świeża", "Bardzo duży roślinożerca.", "Hodowany w stawach.", "PL: introdukcja gospodarcza."),
        row("silver-carp", "Tołpyga biaława", "Hypophthalmichthys molitrix", "Karpiowate", "PL,EU", 3.0, 28, "tusza świeża", "Skacze przy hałasie.", "Filtrator planktonu.", "PL: introdukcja w Wiśle."),
        row("bighead-carp", "Tołpyga bycza", "Hypophthalmichthys nobilis", "Karpiowate", "PL,EU", 5.0, 30, "tusza świeża", "Duży filtrator.", "Ogromna paszcza.", "PL: introdukcja."),
        row("sunbleak", "Krasnopiór krągły", "Leucaspius delineatus", "Karpiowate", "PL,EU", 0.05, 12, "tusza świeża", "Najmniejszy karpiowaty PL.", "Żyje w roślinności.", "PL: licznie w nizinnych wodach."),
        row("sichel", "Ukleja czarnooka", "Pelecus cultratus", "Karpiowate", "EU", 1.5, 28, "tusza świeża", "Ostro zakończony kształt.", "Żyje w dużych rzekach.", "EU: Dunaj i Dniestr; nie występuje w PL."),
        row("zander-volga", "Sandacz wolgaski", "Sander volgensis", "Łopieniowate", "EU", 1.8, 50, "filet", "Sandaczowaty.", "Bliski sandaczowi.", "EU: Morze Czarne i Wołga; bez PL."),
        row("european-minnow", "Stwora", "Phoxinus phoxinus", "Karpiowate", "PL,EU", 0.08, 14, "tusza świeża", "Bardzo mała ryba.", "Wskaźnik czystej wody.", "PL: górskie potoki."),
        row("sneep", "Głowienka", "Chondrostoma soetta", "Karpiowate", "EU", 0.9, 26, "tusza świeża", "Rzeczny karpiowiec.", "Gatunek chroniony w Alpach.", "EU: Italia i Alpy; brak PL."),
        row("carp-bream", "Linijka", "Abramis sapa", "Karpiowate", "PL,EU", 0.6, 24, "tusza świeża", "Smukły leszczowaty.", "Długi pysk jak lin.", "PL: Wisła i Odra."),
        row("whitefin", "Różanka pstra", "Rhodeus sericeus", "Karpiowate", "PL,EU", 0.05, 15, "tusza świeża (rzadko)", "Kolorowa samiec lęgowy.", "Ikra w małżu.", "PL: nizinne wody."),
    ]

    baltic: list[dict] = [
        row("herring", "Śledź atlantycki", "Clupea harengus", "Śledziowate", "PL,EU", 0.35, 18, "śledź solony", "Smukła ryba stadna.", "Kluczowy gatunek Bałtyku.", "PL: poławiany na Bałtyku."),
        row("sprat", "Szprot", "Sprattus sprattus", "Clupeidae", "PL,EU", 0.08, 12, "wędzony", "Drobna ryba morska.", "Tłuste mięso.", "PL: wody przybrzeżne Bałtyku."),
        row("cod-baltic", "Dorsz bałtycki", "Gadus morhua callarias", "Dorszowate", "PL,EU", 2.5, 52, "filet", "Mniejsza forma dorsza.", "Białomięsna ryba.", "PL: Bałtyk."),
        row("flounder", "Flądra", "Platichthys flesus", "Flądrowate", "PL,EU", 0.6, 38, "filet", "Płaski ciało i oba oczy z jednej strony.", "Przy dnie piaszczystym.", "PL: cały Bałtyk."),
        row("dab", "Gładzica", "Limanda limanda", "Płastugowate", "PL,EU", 0.35, 36, "filet", "Mała płaska ryba.", "Okrągły kształt.", "PL: północny Bałtyk."),
        row("plaice", "Gładzica pospolita", "Pleuronectes platessa", "Płastugowate", "PL,EU", 0.7, 42, "filet", "Płaska ryba z pomarańczowymi plamkami.", "Ceniona w kuchni.", "PL: Bałtyk Południowy."),
        row("turbot", "Pstrażnik", "Scophthalmus maximus", "Płastugowate", "EU", 3.0, 120, "filet", "Drogie rybo mięsiste.", "Diamentowy wzór na skórze.", "EU: Atlantyk; brak w Bałtyku PL."),
        row("brill", "Pstrażnica", "Scophthalmus rhombus", "Płastugowate", "EU", 1.5, 85, "filet", "Podobna do turbotu.", "Rhomboidalny kształt.", "EU: Atlantyk północny; import."),
        row("sole", "Wiecznica", "Solea solea", "Płastugowate", "EU", 0.45, 95, "filet", "Delikatna płaska ryba.", "Mała głowa.", "EU: Morze Północne; brak na Bałtyku PL."),
        row("angler", "Żabnica", "Lophius piscatorius", "Żabnicowate", "EU", 4.0, 48, "ogon filet", "Brzydka aparycja, smaczne ogon.", "Wabik na grzbiecie.", "EU: Atlantyk; import na PL."),
        row("hake", "Morszczuk", "Merluccius merluccius", "Morszczukowate", "EU", 2.0, 44, "filet", "Długi tułów.", "Popularny w Kulinarionie EU.", "EU: Atlantyk; nie w Bałtyku PL."),
        row("whiting", "Mintaj", "Merlangius merlangus", "Dorszowate", "PL,EU", 0.5, 32, "filet", "Drobny dorszowaty.", "Białe mięso.", "PL: Bałtyk i Ocean."),
        row("haddock", "Plamiak", "Melanogrammus aeglefinus", "Dorszowate", "EU", 1.0, 48, "filet", "Czarna plama boku.", "Klasyczna ryba brytyjska.", "EU: Północne morza; import."),
        row("pollock", "Szczupiak", "Pollachius pollachius", "Dorszowate", "PL,EU", 1.5, 46, "filet", "Długie ciało.", "Szczupiak to chudoręki dorszowaty, ceniony na bałtyckich stołach.", "PL: Bałtyk."),
        row("saithe", "Czarniak", "Pollachius virens", "Dorszowate", "EU", 2.5, 42, "filet", "Dorszowaty o zielonawym grzbiecie.", "Czarniak ma białe, dość twarde mięso i smukłe ciało.", "EU: Północny Atlantyk; import."),
        row("blue-whiting", "Szprotnik", "Micromesistius poutassou", "Dorszowate", "EU", 0.25, 22, "filet mrożony", "Mały dorszowaty.", "Poławiany przemysłowo.", "EU: Atlantyk NE; przetwórstwo."),
        row("tusk", "Kijanka", "Brosme brosme", "Moridae", "EU", 2.0, 55, "filet", "Wąskooki dorszowaty.", "Dno głębinowe.", "EU: Atlantyk północny."),
        row("ling", "Moloł", "Molva molva", "Moridae", "EU", 4.0, 50, "filet", "Długa dorszowata ryba.", "Drapieżna.", "EU: Atlantyk; import."),
        row("rockling", "Gadella", "Gaidropsarus vulgaris", "Moridae", "PL,EU", 0.3, 20, "tusza", "Drobny gad.", "Trzy wąsy.", "PL: Bałtyk."),
        row("round-goby", "Babka bycza", "Neogobius melanostomus", "Gobie", "PL,EU", 0.12, 18, "tusza", "Inwazyjna babka.", "Agresywna na dnie.", "PL: Bałtyk od lat 90."),
        row("black-goby", "Babka marmurkowana", "Neogobius niger", "Gobie", "PL,EU", 0.1, 17, "tusza", "Drobna ryba morska.", "Marmurkowe cętki.", "PL: Zatoka Gdańska."),
        row("sand-goby", "Babka piaskowa", "Pomatoschistus minutus", "Gobie", "PL,EU", 0.04, 14, "tusza", "Bardzo mała.", "W płytkiej wodzie.", "PL: brzegi Bałtyku."),
        row("smelt", "Stynka", "Osmerus eperlanus", "Stynkowate", "PL,EU", 0.12, 28, "wędzonka", "Drobna srebrna ryba.", "Klasyczna przystawka z Bałtyku.", "PL: delty i Zatoka."),
    ]

    all_new = (pl + pl_more + baltic + EXTRA_SPECIES)[:200]
    seen_id: set[str] = set()
    seen_latin: set[str] = set()
    out: list[dict] = []
    for fish in LEGACY + all_new:
        if fish["id"] in seen_id:
            raise SystemExit(f"duplikat id: {fish['id']}")
        key = fish["nameLatin"].casefold()
        if key in seen_latin:
            raise SystemExit(f"duplikat łaciny: {fish['nameLatin']}")
        seen_id.add(fish["id"])
        seen_latin.add(key)
        out.append(fish)

    if len(out) != 205:
        raise SystemExit(f"oczekiwano 205 gatunków, jest {len(out)}")
    return out


def main() -> None:
    data = seeds()
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    pl = sum(1 for f in data if "PL" in f["pools"])
    eu_only = sum(1 for f in data if f["pools"] == ["EU"])
    print(f"Zapisano {len(data)} seedów · PL tag={pl} · tylko EU={eu_only}")


if __name__ == "__main__":
    main()