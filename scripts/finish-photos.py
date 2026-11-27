#!/usr/bin/env python3
"""Pobiera brakujące zdjęcia (commons) i uzupełnia photo-credits.json."""

from __future__ import annotations

import importlib.util
import json
import time
from pathlib import Path

_builder = Path(__file__).with_name("build-fish-catalog.py")
_spec = importlib.util.spec_from_file_location("build_fish_catalog", _builder)
if _spec is None or _spec.loader is None:
    raise SystemExit("brak build-fish-catalog.py")
_build = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_build)
fetch_commons_image = _build.fetch_commons_image
strip_meta = _build.strip_meta

ROOT = Path(__file__).resolve().parents[1]
SEEDS = Path(__file__).with_name("fish-species-seeds.json")
CREDITS = Path(__file__).with_name("photo-credits.json")
PHOTOS = ROOT / "src/content/photos"


def main() -> int:
    seeds = json.loads(SEEDS.read_text(encoding="utf-8"))
    credits = json.loads(CREDITS.read_text(encoding="utf-8")) if CREDITS.is_file() else {}
    PHOTOS.mkdir(parents=True, exist_ok=True)
    pending = [s for s in seeds if not (PHOTOS / f"{s['id']}.jpg").is_file()]
    print(f"do pobrania: {len(pending)}")
    failed: list[str] = []
    for index, seed in enumerate(pending, 1):
        print(f"[{index}/{len(pending)}] {seed['nameLatin']}")
        try:
            row = fetch_commons_image(seed["nameLatin"], seed.get("commonsFile"))
        except Exception as exc:  # noqa: BLE001
            failed.append(f"{seed['id']}: {exc}")
            continue
        if not row:
            failed.append(f"{seed['id']}: brak JPEG")
            continue
        raw, author, license_ = row
        (PHOTOS / f"{seed['id']}.jpg").write_bytes(strip_meta(raw))
        credits[seed["id"]] = {"author": author, "license": license_}
        CREDITS.write_text(json.dumps(credits, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        time.sleep(2.0)
    if failed:
        for line in failed:
            print("!", line)
    have = sum(1 for s in seeds if (PHOTOS / f"{s['id']}.jpg").is_file())
    print(f"na dysku: {have}/{len(seeds)}")
    return 0 if have == len(seeds) else 1


if __name__ == "__main__":
    raise SystemExit(main())