import json, os
from fastapi import APIRouter

router = APIRouter(prefix="/term-sheet", tags=["term_sheet"])

def _load():
    p = os.path.join(os.path.dirname(__file__), "../../data/term_sheet_glossary.json")
    with open(p) as f:
        return json.load(f)

@router.get("/glossary")
async def list_terms(
    search: str = "",
    category: str = "",
    difficulty: str = "",
    limit: int = 100,
    offset: int = 0,
):
    terms = _load()

    if search:
        q = search.lower()
        terms = [
            t for t in terms
            if q in t.get("term", "").lower()
            or q in t.get("definition", "").lower()
            or q in t.get("category", "").lower()
            or any(q in rt.lower() for rt in t.get("related_terms", []))
        ]
    if category:
        terms = [t for t in terms if t.get("category", "").lower() == category.lower()]
    if difficulty:
        terms = [t for t in terms if t.get("difficulty", "").lower() == difficulty.lower()]

    total = len(terms)
    return {"total": total, "terms": terms[offset : offset + limit]}

@router.get("/glossary/{term_id}")
async def get_term(term_id: str):
    terms = _load()
    for t in terms:
        if t["id"] == term_id:
            return t
    return {"error": "Not found"}, 404
