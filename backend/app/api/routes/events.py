from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, Query

router = APIRouter(prefix="/events", tags=["events"])

_DATA = Path(__file__).parent.parent.parent / "data"


def _load(name: str):
    with open(_DATA / name) as f:
        return json.load(f)


@router.get("")
async def list_events(
    category: str | None = Query(None),
    city: str | None = Query(None),
    mode: str | None = Query(None),
    free_only: bool | None = Query(None),
    search: str | None = Query(None),
):
    items = _load("events.json")
    if category:
        items = [e for e in items if category.lower() in e.get("category", "").lower()]
    if city:
        items = [e for e in items if city.lower() in e.get("city", "").lower() or "pan india" in e.get("city", "").lower()]
    if mode:
        items = [e for e in items if mode.lower() in e.get("mode", "").lower()]
    if free_only is True:
        items = [e for e in items if e.get("free") is True]
    if search:
        q = search.lower()
        items = [
            e for e in items
            if q in e.get("name", "").lower()
            or q in e.get("organizer", "").lower()
            or q in e.get("description", "").lower()
            or any(q in t for t in e.get("tags", []))
        ]
    return items
