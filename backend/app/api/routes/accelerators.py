from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, Query

router = APIRouter(prefix="/accelerators", tags=["accelerators"])
_DATA = Path(__file__).parent.parent.parent / "data"


def _load(name: str):
    with open(_DATA / name) as f:
        return json.load(f)


@router.get("")
async def list_accelerators(
    search: str | None = Query(None),
    stage: str | None = Query(None),
    sector: str | None = Query(None),
    equity_free: bool | None = Query(None),
    limit: int = Query(50, le=100),
    offset: int = Query(0),
):
    accels = _load("accelerators.json")
    if search:
        q = search.lower()
        accels = [a for a in accels if
                  q in a["name"].lower() or
                  q in a.get("description", "").lower() or
                  any(q in s.lower() for s in a.get("sectors", [])) or
                  any(q in t.lower() for t in a.get("tags", []))]
    if stage:
        accels = [a for a in accels if any(stage.lower() in s.lower() for s in a.get("stage", []))]
    if sector:
        accels = [a for a in accels if
                  any(sector.lower() in s.lower() for s in a.get("sectors", [])) or
                  "All Sectors" in a.get("sectors", [])]
    if equity_free is True:
        accels = [a for a in accels if a.get("equity") == "0%"]
    total = len(accels)
    return {"total": total, "accelerators": accels[offset: offset + limit]}


@router.get("/{accel_id}")
async def get_accelerator(accel_id: str):
    accels = _load("accelerators.json")
    for a in accels:
        if a["id"] == accel_id:
            return a
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Accelerator not found")
