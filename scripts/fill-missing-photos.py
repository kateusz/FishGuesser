#!/usr/bin/env python3
"""Ponytail: gdy Commons nie odda JPEG, skopiuj zdjęcie bliźniaczej rodziny (tylko braki)."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

SEEDS = Path(__file__).with_name("fish-species-seeds.json")
CREDITS = Path(__file__).with_name("photo-credits.json")
PHOTOS = Path(__file__).resolve().parents[1] / "src/content/photos"


def main() -> int:
    seeds = json.loads(SEEDS.read_text(encoding="utf-8"))
    credits = json.loads(CREDITS.read_text(encoding="utf-8")) if CREDITS.is_file() else {}
    filled = 0
    for seed in seeds:
        target = PHOTOS / f"{seed['id']}.jpg"
        if target.is_file():
            continue
        donor = None
        for other in seeds:
            candidate = PHOTOS / f"{other['id']}.jpg"
            if other["family"] == seed["family"] and candidate.is_file():
                donor = other
                break
        if not donor:
            fallback = PHOTOS / "perch.jpg"
            if fallback.is_file():
                donor = {"id": "perch", "namePl": "okaz zastępczy"}
        if not donor:
            continue
        shutil.copy2(PHOTOS / f"{donor['id']}.jpg", target)
        credits[seed["id"]] = {
            "author": f"zastępcze zdjęcie ({donor['id']})",
            "license": "sprawdź oryginał na Commons",
        }
        filled += 1
    CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    missing = [s["id"] for s in seeds if not (PHOTOS / f"{s['id']}.jpg").is_file()]
    print(f"uzupełniono {filled}, nadal brak: {len(missing)}")
    return 1 if missing else 0


if __name__ == "__main__":
    raise SystemExit(main())