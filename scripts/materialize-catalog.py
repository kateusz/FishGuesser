#!/usr/bin/env python3
"""Składa fish-catalog.json z fish-species-seeds.json + photo-credits.json + JPEG."""

from __future__ import annotations

import json
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SEEDS = Path(__file__).with_name("fish-species-seeds.json")
CREDITS = Path(__file__).with_name("photo-credits.json")
CATALOG = ROOT / "src/content/fish-catalog.json"
PHOTOS = ROOT / "src/content/photos"


def seed_to_fish(seed: dict, author: str, license_: str) -> dict:
    today = date.today().isoformat()
    note = f"{seed['regionNote']} · {seed['weightNote']}"
    photo = f"{seed['id']}.jpg"
    return {
        "id": seed["id"],
        "namePl": seed["namePl"],
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
        "photoFile": photo,
    }


def main() -> int:
    seeds = json.loads(SEEDS.read_text(encoding="utf-8"))
    credits = json.loads(CREDITS.read_text(encoding="utf-8")) if CREDITS.is_file() else {}
    missing: list[str] = []
    out: list[dict] = []
    for seed in seeds:
        photo = PHOTOS / f"{seed['id']}.jpg"
        if not photo.is_file():
            missing.append(seed["id"])
            continue
        meta = credits.get(seed["id"]) or {}
        author = str(meta.get("author") or "Wikimedia Commons")
        license_ = str(meta.get("license") or "sprawdź na Commons")
        out.append(seed_to_fish(seed, author, license_))
    print(f"gotowe {len(out)}/{len(seeds)} · brak zdjęć: {len(missing)}")
    if len(out) != len(seeds):
        return 1
    CATALOG.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"zapisano {CATALOG}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())