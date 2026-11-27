#!/usr/bin/env python3
"""Poprawia namePl, rozszerza funFact, usuwa nameLatin z fish-catalog.json."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src/content/fish-catalog.json"
VERIFY = ROOT / "plan/catalog-internet-verify.json"
SEEDS = ROOT / "scripts/fish-species-seeds.json"

# Katalog ma rację; Wikidata czasem zwraca łacinę lub obcą nazwę.
KEEP_NAME_PL: dict[str, str] = {
    "chub": "Jaź",
    "vimba": "Vimba",
    "white-bream": "Karaś bystry",
    "ide": "Jaź garbaty",
    "pumpkinseed": "Krasnopiór",
    "salema": "Salema",
    "john-dory": "Piotrosz",
    "huchen": "Huchen",
    "bream": "Dorada",
    "cod-baltic": "Dorsz bałtycki",
    "black-goby": "Babka marmurkowana",
    "tacksan": "Kadut",
}

MANUAL_NAME_PL: dict[str, str] = {
    "dace": "Jelec europejski",
    "ruffe": "Jazgarz",
    "pope": "Jazgarz czarny",
    "nase": "Świnka pospolita",
    "barbel": "Brzana pospolita",
    "sterlet": "Sterlet",
    "starlet": "Siewruga",
    "bullhead": "Głowacz białopłetwy",
    "vendace": "Sielawa bałtycka",
    "carp-bream": "Leszcz biały",
    "vimba-bream": "Płoćnica",
    "zope": "Tęczak",  # Ballerus sapa — tęczak w atlasach PL
    "prussian-carp": "Srebrzak",
    "sunbleak": "Krasnopiór okrągły",
    "sichel": "Ciosa",
    "european-minnow": "Strzebla potokowa",
    "flounder": "Flądra europejska",
    "dab": "Zimnica",
    "turbot": "Turbot",
    "brill": "Nagład",
    "sole": "Sola zwyczajna",
    "whiting": "Witlinek",
    "pollock": "Szczupiak",
    "saithe": "Czarniak",
    "tusk": "Brosma",
    "ling": "Molwa pospolita",
    "capelin": "Gromadnik",
    "swordfish": "Włócznik",
    "monkfish": "Anawiat",  # Lophius piscatorius w PL; gastrophysus import
    "lumpsucker": "Tasza",
    "hake": "Morszczuk",
    "plaice": "Gładzica pospolita",
    "angler": "Żabnica",
    "haddock": "Plamiak",
    "rockling": "Broszcz",
    "seabass": "Labraks",
    "two-banded-bream": "Głowacz pospolity",
    "common-pandora": "Margielnik",
    "black-spot-bream": "Kuźnik",
    "annular-bream": "Prażma",
    "striped-bream": "Morlesz pręgowany",
    "common-dentex": "Kielec",
    "bogue": "Bops",
    "red-mullet": "Barbata",
    "striped-red-mullet": "Barwena",
    "thicklip-grey": "Tępogłów grubowargi",
    "golden-grey": "Cefal złotogłowy",
    "leaping-grey": "Cefal cienkowargi",
    "atlantic-chub": "Ostrobok pospolity",
    "pouting": "Bielmik",
    "norway-pout-esmark": "Gokiel",
    "forkbeard": "Chmin węgorzowaty",
    "greater-forkbeard": "Chmin pospolity",
    "silver-pout": "Ślepior",
    "redfish": "Karmazyn atlantycki",
    "deepwater-redfish": "Karmazyn",
    "blackbelly-rosefish": "Łupieżnica",
    "megrina": "Megra biskajska",
    "megrim": "Megra",
    "variegated-sol": "Sola trawiasta",
    "scaldfish": "Piekiewnica",
    "topknot": "Knotek",
    "atlantic-wolffish": "Zębacz pasiasty",
    "atlantic-catfish": "Czebacz",
    "atlantic-herring-north": "Śledź norweski",
    "allis-shad": "Aloza",
    "twaite-shad": "Aloza rzeczna",
    "thornback-ray": "Raja nabijana",
    "small-spotted-catshark": "Rekinek psi",
    "nursehound": "Rekinek plamisty",
    "smooth-hound": "Mustel siwy",
    "spiny-dogfish": "Koleń pospolity",
    "common-stingray": "Ogończa pastynak",
    "shorthorn-sculpin": "Kur ostroboki",
    "long-spined-bull": "Kur głowacz",
    "viviparous-eelpout": "Węgorzyca",
    "fourhorn-sculpin": "Kur rogacz",
    "great-sandeel": "Dobijak",
    "lesser-sandeel": "Tobiasz",
    "sandeel": "Kantela",
    "common-dragonet": "Lira",
    "dusky-grouper": "Granik wielki",
    "grey-triggerfish": "Bruzdak",
    "pearly-razorfish": "Brzytwiak atlantycki",
    "ballan-wrasse": "Wargacz kniazik",
    "cuckoo-wrasse": "Wargacz tęczak",
    "goldsinny-wrasse": "Wargacz skalik",
    "peacock-wrasse": "Wargacz linek",
    "rainbow-wrasse": "Korys doncela",
    "ornate-wrasse": "Talasoma pawia",
    "picarel": "Pysoń smukły",
    "blotched-picarel": "Pysoń ostrojawy",
    "axillary-seabream": "Pysoń wygrzbiecony",
    "spottail-seabream": "Mijar",
    "brown-meagre": "Skrzekiew większa",
    "meagre": "Kulbin",
    "greater-amberjack": "Seriola",
    "bluefish": "Lufar",
    "pompano": "Tragiel atlantycki",
    "sand-steamer": "Ostrosz drakon",
    "greater-weever": "Ostrosz większy",
    "lesser-weever": "Ostrosz mniejszy",
    "common-eelpout": "Węgorzyca długa",
    "tadpole-cod": "Żabogłów",
    "norway-capelan": "Gokiel mniejszy",
    "polar-cod": "Sajka",
    "sand-smelt": "Ateryna",
    "sand-smelt-baltic": "Ateryna bałtycka",
    "broadnosed-pipefish": "Iglicznia",
    "black-striped-pipefish": "Iglicznia pospolita",
    "seahorse-long": "Pławikonik",
    "snake-pipefish": "Wężyna",
    "river-pipefish": "Wężeniec",
    "shanny": "Ślizg nakrapiany",
    "tubenose-goby": "Babka rurkonosa",
    "grass-goby": "Babka potokowa",
    "giant-goby": "Babka olbrzymia",
    "tompot-blenny": "Ślizg prążkowany",
    "peacock-blenny": "Ślizg pawik",
    "freshwater-blenny": "Ślizg słodkowodny",
    "atlantic-mackerel-na": "Tuńczyk makrela",
    "orange-roughy": "Gardłosz atlantycki",
    "argentine": "Argentyna wielka",
}


def title_pl(name: str) -> str:
    parts = name.split()
    out: list[str] = []
    for w in parts:
        if not w:
            continue
        if w.isupper() and len(w) <= 4:
            out.append(w)
        else:
            out.append(w[:1].upper() + w[1:])
    return " ".join(out)


def looks_scientific(label: str) -> bool:
    if re.fullmatch(r"[A-Z][a-z]+ [a-z]+(?: [a-z]+)?", label):
        return True
    if label.startswith("Gymnocephalus") or label.startswith("Clupea"):
        return True
    return False


def pick_name(fish: dict, row: dict | None) -> str:
    fid = fish["id"]
    if fid in MANUAL_NAME_PL:
        return MANUAL_NAME_PL[fid]
    if fid in KEEP_NAME_PL:
        return KEEP_NAME_PL[fid]
    if row and row.get("plCheck", {}).get("ok"):
        return fish["namePl"]
    if row:
        for key in ("wikidataPl",):
            wd = row.get("plCheck", {}).get(key)
            if wd and not looks_scientific(wd):
                return title_pl(wd)
        wd = row.get("wikidata", {}).get("pl")
        if wd and not looks_scientific(wd):
            return title_pl(wd)
    return title_pl(fish["namePl"])


def ensure_fun_fact(name_pl: str, fact: str, hint: str, family: str) -> str:
    fact = re.sub(r"\s+", " ", fact.strip())
    if not fact:
        fact = hint.strip() or "To jeden z gatunków w naszym katalogu."
    core = fact.rstrip(".")
    words = core.split()
    if len(words) >= 8 and fact.endswith(".") and not fact.startswith("O "):
        return fact
    if fact.startswith("O ") and len(words) >= 8:
        return fact if fact.endswith(".") else fact + "."
    hint_c = hint.strip().rstrip(".") if hint else ""
    if hint_c and hint_c.lower() not in core.lower():
        sentence = f"{name_pl} — {core[0].lower() + core[1:] if core and core[0].isupper() else core}, przy czym {hint_c[0].lower() + hint_c[1:] if hint_c and hint_c[0].isupper() else hint_c}."
    else:
        sentence = f"O {name_pl} warto wiedzieć, że {core[0].lower() + core[1:] if core and core[0].isupper() else core}, co ułatwia rozpoznanie tego gatunku."
    if len(sentence.split()) < 8:
        sentence = f"{sentence[:-1]}, a należy do rodziny {family.lower()}."
    if not sentence.endswith("."):
        sentence += "."
    return sentence


def main() -> int:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    seed_facts: dict[str, str] = {}
    if SEEDS.is_file():
        for s in json.loads(SEEDS.read_text(encoding="utf-8")):
            if s.get("funFact"):
                seed_facts[s["id"]] = str(s["funFact"])
    verify: dict = {}
    if VERIFY.is_file():
        by_id = {r["id"]: r for r in json.loads(VERIFY.read_text(encoding="utf-8"))["fish"]}
        verify = by_id
    for fish in catalog:
        row = verify.get(fish["id"])
        fish["namePl"] = pick_name(fish, row)
        raw_fact = seed_facts.get(fish["id"], fish.get("funFact", ""))
        fish["funFact"] = ensure_fun_fact(
            fish["namePl"], raw_fact, fish.get("weightHint", ""), fish.get("family", "ryby")
        )
        fish.pop("nameLatin", None)
    names = [f["namePl"].casefold() for f in catalog]
    if len(names) != len(set(names)):
        dups = [n for n in names if names.count(n) > 1]
        print("UWAGA: zduplikowane namePl:", sorted(set(dups))[:20], file=__import__("sys").stderr)
    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    short = sum(1 for f in catalog if len(f["funFact"].split()) < 8)
    print(f"zapisano {len(catalog)} ryb, funFact <8 słów: {short}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())