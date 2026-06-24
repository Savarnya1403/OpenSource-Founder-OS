from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/incubators", tags=["incubators"])

_DATA = Path(__file__).parent.parent.parent / "data"


def _load(name: str):
    with open(_DATA / name) as f:
        return json.load(f)


@router.get("")
async def list_incubators(
    state: str | None = Query(None),
    sector: str | None = Query(None),
    stage: str | None = Query(None),
    equity_free: bool | None = Query(None),
    search: str | None = Query(None),
):
    items = _load("incubators.json")
    if state:
        items = [i for i in items if state.lower() in i.get("state", "").lower()]
    if sector:
        items = [
            i for i in items
            if any(sector.lower() in s.lower() for s in i.get("focus_sectors", []))
        ]
    if stage:
        items = [
            i for i in items
            if any(stage.lower() in st.lower() for st in i.get("stage", []))
        ]
    if equity_free is True:
        items = [i for i in items if i.get("equity_taken") is False]
    if search:
        q = search.lower()
        items = [
            i for i in items
            if q in i.get("name", "").lower()
            or q in i.get("description", "").lower()
            or q in i.get("city", "").lower()
            or q in i.get("institution", "").lower()
            or any(q in t for t in i.get("tags", []))
        ]
    return items


@router.get("/{incubator_id}")
async def get_incubator(incubator_id: str):
    items = _load("incubators.json")
    for item in items:
        if item["id"] == incubator_id:
            return item
    raise HTTPException(status_code=404, detail="Incubator not found")
