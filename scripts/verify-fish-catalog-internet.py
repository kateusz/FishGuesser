#!/usr/bin/env python3
"""Weryfikuje nazwy łacińskie (GBIF) i polskie (Wikidata) w fish-catalog.json."""

from __future__ import annotations

import json
import re
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "src/content/fish-catalog.json"
REPORT = ROOT / "plan" / "catalog-internet-verify.json"
USER_AGENT = "FishGuesser-catalog-verify/1.0 (educational)"

# ponytail: one GET per species × two APIs; ~minute total. Upgrade: parallel pool if catalog grows 10×.


def get_json(url: str, attempt: int = 0) -> dict | list | None:
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as exc:
        if attempt < 2:
            time.sleep(1 + attempt)
            return get_json(url, attempt + 1)
        return {"_error": str(exc)}


def norm_pl(s: str) -> str:
    s = s.casefold().strip()
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"[^\w\sąćęłńóśźż\- ]", "", s, flags=re.I)
    return s


def gbif_match(latin: str) -> dict:
    q = urllib.parse.urlencode({"name": latin, "verbose": "true"})
    raw = get_json(f"https://api.gbif.org/v1/species/match?{q}")
    if not isinstance(raw, dict):
        return {"ok": False, "reason": "brak odpowiedzi GBIF"}
    if raw.get("_error"):
        return {"ok": False, "reason": raw["_error"]}
    mt = raw.get("matchType") or "NONE"
    conf = raw.get("confidence") or 0
    accepted = raw.get("scientificName") or raw.get("canonicalName") or ""
    rank = raw.get("rank") or ""
    kingdom = raw.get("kingdom") or ""
    issues: list[str] = []
    ok = mt in ("EXACT", "HIGHERRANK") and conf >= 90
    if mt not in ("EXACT", "HIGHERRANK", "FUZZY"):
        issues.append(f"matchType={mt}")
    elif mt == "FUZZY":
        issues.append(f"rozmyte dopasowanie → {accepted}")
        ok = conf >= 95
    if kingdom and kingdom != "Animalia":
        issues.append(f"kingdom={kingdom}")
        ok = False
    if rank and rank not in ("SPECIES", "SUBSPECIES", "FORM", "VARIETY"):
        issues.append(f"rank={rank}")
    # canonical binomial should match input
    latin_cf = latin.casefold()
    if accepted and latin_cf not in accepted.casefold() and accepted.casefold() not in latin_cf:
        issues.append(f"GBIF: {accepted}")
        if mt == "EXACT":
            ok = False
    return {
        "ok": ok,
        "matchType": mt,
        "confidence": conf,
        "acceptedName": accepted,
        "rank": rank,
        "kingdom": kingdom,
        "issues": issues,
    }


def wikidata_pl_name(latin: str) -> dict:
    """Etykieta PL z Wikidata dla taksonu (P225)."""
    sparql = f"""
SELECT ?item ?plLabel ?enLabel WHERE {{
  ?item wdt:P225 "{latin.replace('"', "")}" .
  ?item rdfs:label ?plLabel . FILTER(LANG(?plLabel) = "pl")
  OPTIONAL {{ ?item rdfs:label ?enLabel . FILTER(LANG(?enLabel) = "en") }}
}} LIMIT 5
""".strip()
    url = (
        "https://query.wikidata.org/sparql?"
        + urllib.parse.urlencode({"query": sparql, "format": "json"})
    )
    raw = get_json(url)
    if not isinstance(raw, dict) or raw.get("_error"):
        return {"ok": False, "pl": None, "reason": (raw or {}).get("_error", "brak Wikidata")}
    bindings = raw.get("results", {}).get("bindings", [])
    if not bindings:
        # fallback: search by label
        s = urllib.parse.urlencode(
            {"action": "wbsearchentities", "search": latin, "language": "en", "type": "item", "format": "json"}
        )
        search = get_json(f"https://www.wikidata.org/w/api.php?{s}")
        if isinstance(search, dict):
            for hit in search.get("search", [])[:3]:
                eid = hit.get("id")
                if not eid:
                    continue
                ent = get_json(
                    f"https://www.wikidata.org/wiki/Special:EntityData/{eid}.json"
                )
                if not isinstance(ent, dict):
                    continue
                entity = ent.get("entities", {}).get(eid, {})
                claims = entity.get("claims", {})
                taxon = claims.get("P225", [{}])[0].get("mainsnak", {}).get("datavalue", {}).get("value", "")
                if norm_pl(taxon) != norm_pl(latin):
                    continue
                labels = entity.get("labels", {})
                pl = (labels.get("pl") or {}).get("value")
                if pl:
                    return {"ok": True, "pl": pl, "wikidata": eid, "via": "search"}
        return {"ok": False, "pl": None, "reason": "brak wpisu z P225"}
    pl = bindings[0].get("plLabel", {}).get("value")
    eid = bindings[0].get("item", {}).get("value", "").rsplit("/", 1)[-1]
    return {"ok": True, "pl": pl, "wikidata": eid, "via": "sparql"}


def pl_name_match(catalog_pl: str, wd_pl: str | None) -> dict:
    if not wd_pl:
        return {"ok": None, "note": "brak referencji PL"}
    a, b = norm_pl(catalog_pl), norm_pl(wd_pl)
    if a == b:
        return {"ok": True}
    # pierwsze słowo / synonimy częste w grze
    if a.split()[0] == b.split()[0] and len(a.split()) <= 3:
        return {"ok": True, "note": f"skrócona forma; WD: {wd_pl}"}
    if b in a or a in b:
        return {"ok": True, "note": f"zawiera; WD: {wd_pl}"}
    return {"ok": False, "wikidataPl": wd_pl}


def main() -> int:
    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    rows: list[dict] = []
    problems = 0
    for i, fish in enumerate(data):
        latin = fish["nameLatin"]
        gb = gbif_match(latin)
        time.sleep(0.08)
        wd = wikidata_pl_name(latin)
        time.sleep(0.12)
        pl_chk = pl_name_match(fish["namePl"], wd.get("pl"))
        row = {
            "id": fish["id"],
            "namePl": fish["namePl"],
            "nameLatin": latin,
            "family": fish["family"],
            "gbif": gb,
            "wikidata": wd,
            "plCheck": pl_chk,
        }
        bad = (
            not gb.get("ok")
            or pl_chk.get("ok") is False
        )
        row["flag"] = bad
        if bad:
            problems += 1
        rows.append(row)
        if (i + 1) % 25 == 0:
            print(f"... {i + 1}/{len(data)}", file=sys.stderr)

    summary = {
        "total": len(data),
        "flagged": problems,
        "gbif_fail": sum(1 for r in rows if not r["gbif"].get("ok")),
        "pl_fail": sum(1 for r in rows if r["plCheck"].get("ok") is False),
        "pl_unknown": sum(1 for r in rows if r["plCheck"].get("ok") is None),
    }
    out = {"summary": summary, "fish": rows}
    REPORT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    print(f"raport: {REPORT}", file=sys.stderr)
    return 0 if problems == 0 else 2


if __name__ == "__main__":
    raise SystemExit(main())