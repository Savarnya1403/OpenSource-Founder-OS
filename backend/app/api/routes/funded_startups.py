from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, Query

router = APIRouter(prefix="/funded-startups", tags=["funded_startups"])
_DATA = Path(__file__).parent.parent.parent / "data"


def _load(name: str):
    with open(_DATA / name) as f:
        return json.load(f)


@router.get("")
async def list_funded_startups(
    search: str | None = Query(None),
    sector: str | None = Query(None),
    stage: str | None = Query(None),
    city: str | None = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    startups = _load("funded_startups.json")
    if search:
        q = search.lower()
        startups = [s for s in startups if
                    q in s["name"].lower() or
                    q in s.get("sector", "").lower() or
                    q in s.get("sub_sector", "").lower() or
                    any(q in inv.lower() for inv in s.get("key_investors", [])) or
                    any(q in t.lower() for t in s.get("tags", [])) or
                    any(q in f.lower() for f in s.get("founders", []))]
    if sector:
        startups = [s for s in startups if
                    sector.lower() in s.get("sector", "").lower() or
                    sector.lower() in s.get("sub_sector", "").lower()]
    if stage:
        startups = [s for s in startups if stage.lower() in s.get("stage", "").lower()]
    if city:
        startups = [s for s in startups if city.lower() in s.get("city", "").lower()]
    total = len(startups)
    return {"total": total, "startups": startups[offset: offset + limit]}


@router.get("/{startup_id}")
async def get_funded_startup(startup_id: str):
    startups = _load("funded_startups.json")
    for s in startups:
        if s["id"] == startup_id:
            return s
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Startup not found")
