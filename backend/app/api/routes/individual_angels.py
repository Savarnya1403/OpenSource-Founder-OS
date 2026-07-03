import json, os
from fastapi import APIRouter

router = APIRouter(prefix="/individual-angels", tags=["individual_angels"])

def _load():
    p = os.path.join(os.path.dirname(__file__), "../../data/individual_angels.json")
    with open(p) as f:
        return json.load(f)

@router.get("")
async def list_individual_angels(
    search: str = "",
    sector: str = "",
    stage: str = "",
    location: str = "",
    limit: int = 100,
    offset: int = 0,
):
    angels = _load()

    if search:
        q = search.lower()
        angels = [
            a for a in angels
            if q in a.get("name", "").lower()
            or q in a.get("headline", "").lower()
            or q in a.get("bio", "").lower()
            or any(q in s.lower() for s in a.get("sectors", []))
            or any(q in t.lower() for t in a.get("tags", []))
            or any(q in c.lower() for c in a.get("known_investments", []))
        ]
    if sector:
        angels = [a for a in angels if any(sector.lower() in s.lower() for s in a.get("sectors", []))]
    if stage:
        angels = [a for a in angels if any(stage.lower() in st.lower() for st in a.get("stages", []))]
    if location:
        angels = [a for a in angels if location.lower() in a.get("location", "").lower()]

    total = len(angels)
    return {"total": total, "angels": angels[offset : offset + limit]}

@router.get("/{angel_id}")
async def get_angel(angel_id: str):
    angels = _load()
    for a in angels:
        if a["id"] == angel_id:
            return a
    return {"error": "Not found"}, 404
