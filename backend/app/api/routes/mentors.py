from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, Query

router = APIRouter(prefix="/mentors", tags=["mentors"])
_DATA = Path(__file__).parent.parent.parent / "data"


def _load(name: str):
    with open(_DATA / name) as f:
        return json.load(f)


@router.get("")
async def list_mentors(
    search: str | None = Query(None),
    domain: str | None = Query(None),
    stage: str | None = Query(None),
    location: str | None = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    mentors = _load("mentors.json")
    if search:
        q = search.lower()
        mentors = [m for m in mentors if
                   q in m["name"].lower() or
                   q in m.get("company", "").lower() or
                   q in m.get("bio", "").lower() or
                   any(q in d.lower() for d in m.get("domain", [])) or
                   any(q in e.lower() for e in m.get("expertise", [])) or
                   any(q in t.lower() for t in m.get("tags", []))]
    if domain:
        mentors = [m for m in mentors if
                   any(domain.lower() in d.lower() for d in m.get("domain", [])) or
                   any(domain.lower() in s.lower() for s in m.get("sector_focus", []))]
    if stage:
        mentors = [m for m in mentors if
                   any(stage.lower() in s.lower() for s in m.get("stage_preference", []))]
    if location:
        mentors = [m for m in mentors if location.lower() in m.get("location", "").lower()]
    total = len(mentors)
    return {"total": total, "mentors": mentors[offset: offset + limit]}


@router.get("/{mentor_id}")
async def get_mentor(mentor_id: str):
    mentors = _load("mentors.json")
    for m in mentors:
        if m["id"] == mentor_id:
            return m
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Mentor not found")
