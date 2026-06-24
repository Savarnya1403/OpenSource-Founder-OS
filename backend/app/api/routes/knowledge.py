from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

_DATA = Path(__file__).parent.parent.parent / "data"


def _load(name: str):
    with open(_DATA / name) as f:
        return json.load(f)


# ── Case Studies ──────────────────────────────────────────────────────────────

@router.get("/case-studies")
async def list_case_studies(sector: str | None = Query(None)):
    items = _load("case_studies.json")
    if sector:
        items = [c for c in items if sector.lower() in c.get("sector", "").lower()]
    # Return summary (no full sections)
    return [
        {
            "id": c["id"],
            "name": c["name"],
            "tagline": c["tagline"],
            "founders": c["founders"],
            "founded": c["founded"],
            "sector": c["sector"],
            "sub_sector": c["sub_sector"],
            "hq": c["hq"],
            "current_valuation": c["current_valuation"],
            "revenue": c["revenue"],
            "tags": c["tags"],
        }
        for c in items
    ]


@router.get("/case-studies/{case_id}")
async def get_case_study(case_id: str):
    items = _load("case_studies.json")
    for c in items:
        if c["id"] == case_id:
            return c
    raise HTTPException(status_code=404, detail="Case study not found")


# ── Playbooks ─────────────────────────────────────────────────────────────────

@router.get("/playbooks")
async def list_playbooks(sector: str | None = Query(None)):
    items = _load("playbooks.json")
    if sector:
        items = [p for p in items if sector.lower() in p.get("sector", "").lower() or
                 p.get("sector") == "All Sectors"]
    return [
        {
            "id": p["id"],
            "title": p["title"],
            "sector": p["sector"],
            "tagline": p["tagline"],
            "read_time_mins": p["read_time_mins"],
            "tags": p["tags"],
            "section_count": len(p.get("sections", [])),
        }
        for p in items
    ]


@router.get("/playbooks/{playbook_id}")
async def get_playbook(playbook_id: str):
    items = _load("playbooks.json")
    for p in items:
        if p["id"] == playbook_id:
            return p
    raise HTTPException(status_code=404, detail="Playbook not found")


# ── Jargon ────────────────────────────────────────────────────────────────────

@router.get("/jargon")
async def list_jargon(
    search: str | None = Query(None),
    letter: str | None = Query(None),
    category: str | None = Query(None),
):
    items = _load("jargon.json")
    if search:
        q = search.lower()
        items = [j for j in items if q in j["term"].lower() or q in j["definition"].lower()]
    if letter:
        items = [j for j in items if j.get("letter", j["term"][0]).upper() == letter.upper()]
    if category:
        items = [j for j in items if category.lower() in j.get("category", "").lower()]
    # Sort alphabetically
    items.sort(key=lambda j: j["term"].lower())
    return items


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/reports")
async def list_reports(
    category: str | None = Query(None),
    publisher_type: str | None = Query(None),
    search: str | None = Query(None),
):
    items = _load("reports.json")
    if category:
        items = [r for r in items if category.lower() in r.get("category", "").lower()]
    if publisher_type:
        items = [r for r in items if publisher_type.lower() in r.get("publisher_type", "").lower()]
    if search:
        q = search.lower()
        items = [
            r for r in items
            if q in r.get("title", "").lower()
            or q in r.get("publisher", "").lower()
            or q in r.get("description", "").lower()
            or any(q in t for t in r.get("tags", []))
        ]
    return sorted(items, key=lambda r: (-r.get("year", 0), r.get("title", "")))
