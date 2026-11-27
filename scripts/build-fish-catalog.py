#!/usr/bin/env python3
"""Buduje src/content/fish-catalog.json i pobiera JPEG z Wikimedia Commons."""

from __future__ import annotations

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHOTOS = ROOT / "src/content/photos"
CATALOG = ROOT / "src/content/fish-catalog.json"
SEEDS = Path(__file__).with_name("fish-species-seeds.json")
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "FishGuesser-catalog-builder/1.0 (educational; mailto:none)"


def strip_meta(data: bytes) -> bytes:
    if data[:2] != b"\xff\xd8":
        return data
    result = bytearray(data[:2])
    i = 2
    while i + 1 < len(data):
        if data[i] != 0xFF:
            result.extend(data[i:])
            break
        marker = data[i + 1]
        if marker == 0xDA:
            result.extend(data[i:])
            break
        if marker in (0xD0, 0xD1, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0x01):
            result.extend(data[i : i + 2])
            i += 2
            continue
        if i + 4 > len(data):
            break
        length = int.from_bytes(data[i + 2 : i + 4], "big")
        if marker in (0xE1, 0xE2, 0xED, 0xFE):
            i += 2 + length
            continue
        result.extend(data[i : i + 2 + length])
        i += 2 + length
    return bytes(result)


def api_get(params: dict, attempt: int = 0) -> dict:
    url = f"{COMMONS_API}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        if exc.code == 429 and attempt < 8:
            time.sleep(min(60, 2**attempt + 2))
            return api_get(params, attempt + 1)
        raise


def license_from_meta(meta: dict) -> tuple[str, str]:
    artist = (meta.get("Artist") or {}).get("value") or "nieznany autor"
    artist = re.sub(r"<[^>]+>", "", artist).strip()
    license_short = (meta.get("LicenseShortName") or {}).get("value") or ""
    license_url = (meta.get("LicenseUrl") or {}).get("value") or ""
    if "public domain" in license_short.lower() or "pd" in license_short.lower():
        lic = "domena publiczna"
    elif "cc by-sa 4" in license_short.lower():
        lic = "CC BY-SA 4.0"
    elif "cc by-sa 3" in license_short.lower():
        lic = "CC BY-SA 3.0"
    elif "cc by-sa 2" in license_short.lower():
        lic = "CC BY-SA 2.0"
    elif "cc by 4" in license_short.lower():
        lic = "CC BY 4.0"
    elif "cc by 3" in license_short.lower():
        lic = "CC BY 3.0"
    elif "cc by 2" in license_short.lower():
        lic = "CC BY 2.0"
    elif "cc by" in license_short.lower():
        lic = license_short.strip() or "CC BY"
    elif license_url:
        lic = license_short.strip() or license_url
    else:
        lic = license_short.strip() or "sprawdź licencję na Commons"
    return artist[:120], lic[:80]


def fetch_commons_image(latin: str, commons_file: str | None) -> tuple[bytes, str, str] | None:
    targets: list[str] = []
    if commons_file:
        targets.append(commons_file if commons_file.startswith("File:") else f"File:{commons_file}")
    for search in (f'"{latin}"', f"{latin} fish", latin):
        data = api_get(
            {
                "action": "query",
                "format": "json",
                "generator": "search",
                "gsrsearch": search,
                "gsrnamespace": 6,
                "gsrlimit": 12,
                "prop": "imageinfo",
                "iiprop": "url|thumburl|extmetadata|mime",
                "iiurlwidth": 1200,
            }
        )
        pages = (data.get("query") or {}).get("pages") or {}
        for page in pages.values():
            info = (page.get("imageinfo") or [{}])[0]
            url = info.get("thumburl") or info.get("url")
            mime = info.get("mime") or ""
            if not url:
                continue
            if not (mime.startswith("image/jpeg") or info.get("thumburl") or mime.startswith("image/png")):
                continue
            artist, lic = license_from_meta(info.get("extmetadata") or {})
            return download_url(url), artist, lic

    for title in targets:
        data = api_get(
            {
                "action": "query",
                "format": "json",
                "titles": title,
                "prop": "imageinfo",
                "iiprop": "url|thumburl|extmetadata|mime",
                "iiurlwidth": 1200,
            }
        )
        pages = (data.get("query") or {}).get("pages") or {}
        for page in pages.values():
            if page.get("missing"):
                continue
            info = (page.get("imageinfo") or [{}])[0]
            url = info.get("thumburl") or info.get("url")
            mime = info.get("mime") or ""
            if not url or not (mime.startswith("image/jpeg") or info.get("thumburl")):
                continue
            artist, lic = license_from_meta(info.get("extmetadata") or {})
            return download_url(url), artist, lic
    return None


def download_url(url: str, attempt: int = 0) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.read()
    except urllib.error.HTTPError as exc:
        if exc.code == 429 and attempt < 8:
            time.sleep(min(60, 2**attempt + 2))
            return download_url(url, attempt + 1)
        raise


SEED_REQUIRED = (
    "id",
    "namePl",
    "nameLatin",
    "pools",
    "family",
    "weightKg",
    "weightNote",
    "weightHint",
    "pricePln",
    "productForm",
    "funFact",
    "regionNote",
)


def validate_seed(seed: dict) -> None:
    for key in SEED_REQUIRED:
        if key not in seed:
            raise ValueError(f"{seed.get('id', '?')}: brak pola {key}")
    if not re.fullmatch(r"[a-z0-9-]+", seed["id"]):
        raise ValueError(f"zły id: {seed['id']}")
    pools = seed["pools"]
    if not isinstance(pools, list) or not pools or any(p not in ("PL", "EU") for p in pools):
        raise ValueError(f"{seed['id']}: złe pools")
    if "PL" in pools and not seed.get("regionNote", "").strip():
        raise ValueError(f"{seed['id']}: regionNote wymagane dla PL")
    if seed["weightKg"] <= 0 or seed["pricePln"] <= 0:
        raise ValueError(f"{seed['id']}: waga/cena")


def seed_to_fish(seed: dict, author: str, license_: str, photo_file: str) -> dict:
    today = date.today().isoformat()
    note = seed["weightNote"]
    if "regionNote" in seed:
        note = f"{seed['regionNote']} · {note}"
    return {
        "id": seed["id"],
        "namePl": seed["namePl"],
        "nameLatin": seed["nameLatin"],
        "pools": seed["pools"],
        "family": seed["family"],
        "weightKg": seed["weightKg"],
        "weightNote": note,
        "weightHint": seed["weightHint"],
        "pricePln": seed["pricePln"],
        "productForm": seed["productForm"],
        "market": seed.get("market") or f"Cennik orientacyjny · {today}",
        "observedOn": seed.get("observedOn") or today,
        "funFact": seed["funFact"],
        "author": author,
        "license": license_,
        "photoFile": photo_file,
    }


def main() -> int:
    if not SEEDS.is_file():
        print(f"Brak {SEEDS}", file=sys.stderr)
        return 1
    seeds = json.loads(SEEDS.read_text(encoding="utf-8"))
    if len(seeds) < 200:
        print(f"Za mało seedów: {len(seeds)}", file=sys.stderr)
        return 1

    legacy_ids = {"pike", "perch", "cod", "bream", "salmon"}
    by_id: dict[str, dict] = {}
    for seed in seeds:
        validate_seed(seed)
        if seed["id"] in by_id:
            raise SystemExit(f"duplikat id: {seed['id']}")
        by_id[seed["id"]] = seed

    PHOTOS.mkdir(parents=True, exist_ok=True)
    out: list[dict] = []
    failed: list[str] = []

    # ponytail: keep hand-curated demo fish with existing photos + credits
    if CATALOG.is_file():
        existing = {item["id"]: item for item in json.loads(CATALOG.read_text(encoding="utf-8"))}
    else:
        existing = {}

    ordered = sorted(seeds, key=lambda s: s["id"])
    for index, seed in enumerate(ordered):
        photo_file = f"{seed['id']}.jpg"
        path = PHOTOS / photo_file
        prev = existing.get(seed["id"])
        author = (prev or {}).get("author") or ""
        license_ = (prev or {}).get("license") or ""

        if path.is_file() and (author and license_):
            pass
        elif path.is_file() and seed["id"] in legacy_ids:
            author = author or "FishGuesser"
            license_ = license_ or "sprawdź licencję"
        elif path.is_file():
            author = author or "FishGuesser"
            license_ = license_ or "sprawdź licencję"
        else:
            print(f"[{index + 1}/{len(ordered)}] {seed['nameLatin']} …")
            try:
                row = fetch_commons_image(seed["nameLatin"], seed.get("commonsFile"))
            except Exception as exc:  # noqa: BLE001
                failed.append(f"{seed['id']}: {exc}")
                continue
            if not row:
                failed.append(f"{seed['id']}: brak JPEG na Commons")
                continue
            raw, author, license_ = row
            path.write_bytes(strip_meta(raw))
            time.sleep(2.0)

        if not path.is_file():
            failed.append(f"{seed['id']}: brak pliku {photo_file}")
            continue
        out.append(seed_to_fish(seed, author, license_, photo_file))

    if failed:
        print("Nie udało się pobrać:", file=sys.stderr)
        for line in failed:
            print(" ", line, file=sys.stderr)
        if len(out) < 205:
            return 1

    latin_seen: set[str] = set()
    for fish in out:
        key = fish["nameLatin"].casefold()
        if key in latin_seen:
            raise SystemExit(f"duplikat łaciny: {fish['nameLatin']}")
        latin_seen.add(key)

    if len(out) == len(seeds):
        CATALOG.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    elif CATALOG.is_file() and len(out) < len(seeds):
        print(f"Katalog niepełny ({len(out)}/{len(seeds)}); zachowano poprzedni JSON.", file=sys.stderr)
    pl = sum(1 for f in out if "PL" in f["pools"])
    eu = len(out)
    eu_only = sum(1 for f in out if f["pools"] == ["EU"])
    print(f"Katalog: {len(out)} ryb · PL={pl} · EU={eu} · EU\\PL={eu_only}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())