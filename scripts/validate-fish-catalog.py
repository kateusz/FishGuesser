#!/usr/bin/env python3
"""Sprawdza kompletność src/content/fish-catalog.json i plików JPEG."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src/content/fish-catalog.json"
PHOTOS = ROOT / "src/content/photos"
REQUIRED = (
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
    "market",
    "observedOn",
    "funFact",
    "author",
    "license",
    "photoFile",
)


def main() -> int:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    if len(data) != 200:
        print(f"oczekiwano 200 ryb, jest {len(data)}", file=sys.stderr)
        return 1
    ids: set[str] = set()
    latin: set[str] = set()
    for fish in data:
        for key in REQUIRED:
            if key not in fish or fish[key] in ("", None):
                print(f"{fish.get('id')}: brak {key}", file=sys.stderr)
                return 1
        if fish["id"] in ids:
            print(f"duplikat id {fish['id']}", file=sys.stderr)
            return 1
        ids.add(fish["id"])
        key = str(fish["nameLatin"]).casefold()
        if key in latin:
            print(f"duplikat łaciny {fish['nameLatin']}", file=sys.stderr)
            return 1
        latin.add(key)
        if not re.fullmatch(r"[a-z0-9-]+", fish["id"]):
            print(f"zły id {fish['id']}", file=sys.stderr)
            return 1
        pools = fish["pools"]
        if not pools or any(p not in ("PL", "EU") for p in pools):
            print(f"{fish['id']}: złe pools", file=sys.stderr)
            return 1
        if "PL" in pools and "PL:" not in fish["weightNote"]:
            print(f"{fish['id']}: brak uzasadnienia PL w weightNote", file=sys.stderr)
            return 1
        photo = PHOTOS / fish["photoFile"]
        if not photo.is_file():
            print(f"{fish['id']}: brak zdjęcia {photo.name}", file=sys.stderr)
            return 1
        if "sprawd" in str(fish["license"]).lower():
            print(f"{fish['id']}: brak licencji ({fish['license']})", file=sys.stderr)
            return 1
        if "zastępcz" in str(fish["author"]).lower():
            print(f"{fish['id']}: zdjęcie zastępcze", file=sys.stderr)
            return 1
    print(f"OK: {len(data)} ryb, wszystkie pola i JPEG")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())