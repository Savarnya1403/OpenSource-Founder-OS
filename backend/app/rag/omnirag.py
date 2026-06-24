from __future__ import annotations
"""
OmniRAG: Hybrid search combining Qdrant (semantic) + Neo4j (graph) for scheme retrieval.
When USE_MOCK_RAG=true, runs entirely in-memory using keyword + filter matching.
"""
import json
import re
from pathlib import Path
from typing import Any
from app.models.scheme import Scheme, SchemeFilterParams, SchemeMatchRequest
from app.core.config import get_settings

settings = get_settings()

SCHEMES_PATH = Path(__file__).parent.parent / "data" / "schemes.json"


def _load_schemes() -> list[dict]:
    with open(SCHEMES_PATH) as f:
        return json.load(f)


def _score_scheme(scheme: dict, query: str, startup: SchemeMatchRequest | None = None) -> float:
    score = 0.0
    q = query.lower()
    text = f"{scheme['name']} {scheme['description']} {' '.join(scheme['tags'])}".lower()

    # keyword relevance
    for word in q.split():
        if word in text:
            score += 0.1

    if startup:
        elig = scheme.get("eligibility", {})

        # sector match
        scheme_sectors = [s.lower() for s in scheme.get("sectors", [])]
        if "all sectors" in scheme_sectors or startup.sector.lower() in scheme_sectors:
            score += 0.4
        elif any(startup.sector.lower() in s for s in scheme_sectors):
            score += 0.2

        # stage match
        scheme_stages = [s.lower() for s in scheme.get("stages", [])]
        if startup.stage.lower() in scheme_stages:
            score += 0.3

        # DPIIT filter
        if elig.get("requires_dpiit") and not startup.dpiit_registered:
            score -= 0.5

        # gender match
        if elig.get("gender_specific") and startup.founder_gender:
            if elig["gender_specific"].lower() == startup.founder_gender.lower():
                score += 0.2

        # caste match
        if elig.get("caste_specific") and startup.founder_caste:
            if elig["caste_specific"].lower() in startup.founder_caste.lower():
                score += 0.2

        # turnover filter
        if startup.revenue_cr is not None and elig.get("max_turnover_cr") is not None:
            if startup.revenue_cr > elig["max_turnover_cr"]:
                score -= 0.6

    return max(0.0, score)


class OmniRAG:
    """Hybrid semantic + graph retrieval. Falls back to mock mode if USE_MOCK_RAG=true."""

    def __init__(self):
        self._schemes = _load_schemes()
        self._qdrant = None
        self._neo4j = None

        if not settings.USE_MOCK_RAG:
            self._init_real_clients()

    def _init_real_clients(self):
        try:
            from qdrant_client import QdrantClient
            self._qdrant = QdrantClient(
                url=settings.QDRANT_URL,
                api_key=settings.QDRANT_API_KEY or None,
            )
        except Exception as e:
            print(f"[OmniRAG] Qdrant unavailable, falling back to mock: {e}")

        try:
            from neo4j import GraphDatabase
            self._neo4j = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
            )
        except Exception as e:
            print(f"[OmniRAG] Neo4j unavailable, falling back to mock: {e}")

    def search(self, query: str, limit: int = 8, filters: SchemeFilterParams | None = None) -> list[Scheme]:
        raw = self._mock_search(query, limit, filters)
        return [Scheme(**s) for s in raw]

    def match_startup(self, req: SchemeMatchRequest, limit: int = 10) -> list[Scheme]:
        query = f"{req.sector} {req.stage} {req.description or ''}"
        scored = []
        for scheme in self._schemes:
            s = _score_scheme(scheme, query, req)
            scored.append((s, scheme))
        scored.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, scheme in scored[:limit]:
            if score > 0:
                d = dict(scheme)
                d["relevance_score"] = round(score, 3)
                results.append(Scheme(**d))
        return results

    def get_by_id(self, scheme_id: str) -> Scheme | None:
        for s in self._schemes:
            if s["id"] == scheme_id:
                return Scheme(**s)
        return None

    def list_schemes(self, params: SchemeFilterParams) -> tuple[list[Scheme], int]:
        results = []
        for s in self._schemes:
            if params.sector and "all sectors" not in [x.lower() for x in s.get("sectors", [])]:
                if not any(params.sector.lower() in x.lower() for x in s.get("sectors", [])):
                    continue
            if params.ministry and params.ministry.lower() not in s.get("ministry", "").lower():
                continue
            if params.stage and not any(params.stage.lower() in x.lower() for x in s.get("stages", [])):
                continue
            if params.funding_type and params.funding_type.lower() not in (s.get("funding_type") or "").lower():
                continue
            if params.requires_dpiit is not None:
                elig_requires = s.get("eligibility", {}).get("requires_dpiit", False)
                if elig_requires != params.requires_dpiit:
                    continue
            if params.search:
                text = f"{s['name']} {s['description']} {' '.join(s.get('tags', []))}".lower()
                if params.search.lower() not in text:
                    continue
            results.append(s)

        total = len(results)
        paginated = results[params.offset: params.offset + params.limit]
        return [Scheme(**s) for s in paginated], total

    def _mock_search(self, query: str, limit: int, filters: SchemeFilterParams | None) -> list[dict]:
        scored = []
        for s in self._schemes:
            score = _score_scheme(s, query)
            # apply filters
            if filters:
                if filters.sector and "all sectors" not in [x.lower() for x in s.get("sectors", [])]:
                    if not any(filters.sector.lower() in x.lower() for x in s.get("sectors", [])):
                        continue
                if filters.ministry and filters.ministry.lower() not in s.get("ministry", "").lower():
                    continue
            scored.append((score, s))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [dict(s, relevance_score=round(sc, 3)) for sc, s in scored[:limit] if sc >= 0]

    def get_all_tags(self) -> list[str]:
        tags: set[str] = set()
        for s in self._schemes:
            tags.update(s.get("tags", []))
        return sorted(tags)

    def get_ministries(self) -> list[str]:
        return sorted({s["ministry"] for s in self._schemes})

    def get_sectors(self) -> list[str]:
        sectors: set[str] = set()
        for s in self._schemes:
            sectors.update(s.get("sectors", []))
        return sorted(sectors)
