from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/wizards", tags=["wizards"])

_WIZARDS_DIR = Path(__file__).parent.parent.parent / "data" / "wizards"

WIZARD_IDS = ["dpiit", "udyam", "gem", "ip"]


@router.get("")
async def list_wizards():
    result = []
    for wid in WIZARD_IDS:
        path = _WIZARDS_DIR / f"{wid}.json"
        if path.exists():
            with open(path) as f:
                data = json.load(f)
            result.append({
                "id": data["id"],
                "title": data["title"],
                "tagline": data["tagline"],
                "time_estimate": data.get("time_estimate"),
                "difficulty": data.get("difficulty"),
                "step_count": len(data.get("steps", [])) if "steps" in data else None,
            })
    return result


@router.get("/{wizard_id}")
async def get_wizard(wizard_id: str):
    if wizard_id not in WIZARD_IDS:
        raise HTTPException(status_code=404, detail=f"Wizard '{wizard_id}' not found. Available: {WIZARD_IDS}")
    path = _WIZARDS_DIR / f"{wizard_id}.json"
    with open(path) as f:
        return json.load(f)
