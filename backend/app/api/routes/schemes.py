from __future__ import annotations
from fastapi import APIRouter, Query, HTTPException
from app.rag import get_rag
from app.models.scheme import SchemeFilterParams, SchemeMatchRequest, Scheme

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("", response_model=dict)
async def list_schemes(
    search: str | None = Query(None),
    sector: str | None = Query(None),
    stage: str | None = Query(None),
    ministry: str | None = Query(None),
    funding_type: str | None = Query(None),
    requires_dpiit: bool | None = Query(None),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
):
    rag = get_rag()
    params = SchemeFilterParams(
        search=search,
        sector=sector,
        stage=stage,
        ministry=ministry,
        funding_type=funding_type,
        requires_dpiit=requires_dpiit,
        limit=limit,
        offset=offset,
    )
    schemes, total = rag.list_schemes(params)
    return {"total": total, "offset": offset, "limit": limit, "schemes": [s.model_dump() for s in schemes]}


@router.get("/meta")
async def get_metadata():
    rag = get_rag()
    return {
        "ministries": rag.get_ministries(),
        "sectors": rag.get_sectors(),
        "tags": rag.get_all_tags(),
        "funding_types": ["grant", "equity", "loan", "soft loan", "credit guarantee", "non-monetary", "incubation support"],
        "stages": ["Idea", "Pre-Revenue", "Early Revenue", "Growth", "Scale"],
    }


@router.get("/{scheme_id}", response_model=Scheme)
async def get_scheme(scheme_id: str):
    rag = get_rag()
    scheme = rag.get_by_id(scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return scheme


@router.post("/match", response_model=list[Scheme])
async def match_schemes(payload: SchemeMatchRequest):
    rag = get_rag()
    return rag.match_startup(payload, limit=10)


@router.get("/search/{query}", response_model=list[Scheme])
async def search_schemes(query: str, limit: int = Query(8, le=20)):
    rag = get_rag()
    return rag.search(query, limit=limit)
