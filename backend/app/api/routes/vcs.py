from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/vcs", tags=["vcs"])

_DATA = Path(__file__).parent.parent.parent / "data"


def _load(name: str):
    with open(_DATA / name) as f:
        return json.load(f)


@router.get("")
async def list_vcs(
    search: str | None = Query(None),
    stage: str | None = Query(None),
    sector: str | None = Query(None),
    limit: int = Query(30, le=100),
    offset: int = Query(0),
):
    vcs = _load("vcs.json")
    if search:
        q = search.lower()
        vcs = [v for v in vcs if q in v["name"].lower() or q in v.get("description", "").lower() or
               any(q in s.lower() for s in v.get("sectors", [])) or
               any(q in t.lower() for t in v.get("tags", []))]
    if stage:
        vcs = [v for v in vcs if any(stage.lower() in s.lower() for s in v.get("stages", []))]
    if sector:
        vcs = [v for v in vcs if any(sector.lower() in s.lower() for s in v.get("sectors", [])) or
               "All Sectors" in v.get("sectors", [])]
    total = len(vcs)
    return {"total": total, "vcs": vcs[offset: offset + limit]}


@router.get("/angels")
async def list_angels(
    sector: str | None = Query(None),
    stage: str | None = Query(None),
):
    angels = _load("angels.json")
    if sector:
        angels = [a for a in angels if any(sector.lower() in s.lower() for s in a.get("sectors", [])) or
                  "All Sectors" in a.get("sectors", [])]
    if stage:
        angels = [a for a in angels if any(stage.lower() in s.lower() for s in a.get("stages", []))]
    return angels


@router.get("/{vc_id}")
async def get_vc(vc_id: str):
    vcs = _load("vcs.json")
    for v in vcs:
        if v["id"] == vc_id:
            return v
    raise HTTPException(status_code=404, detail="VC not found")
