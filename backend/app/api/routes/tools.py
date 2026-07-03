from __future__ import annotations
import json
from pathlib import Path
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/tools", tags=["tools"])

_DATA = Path(__file__).parent.parent.parent / "data"


def _load(name: str):
    with open(_DATA / name) as f:
        return json.load(f)


# ── Market Size Wizard ────────────────────────────────────────────────────────

class MarketSizeInput(BaseModel):
    sector: str
    geography: str = "All India"
    target_segment_pct: float = 10.0
    product_adoption_pct: float = 5.0
    arpu_inr: float = 5000.0


@router.get("/market-size/sectors")
async def get_market_sectors():
    markets = _load("india_markets.json")
    return [
        {
            "id": m["id"],
            "sector": m["sector"],
            "market_size_usd_bn": m["market_size_usd_bn"],
            "market_size_year": m["market_size_year"],
            "current_size_usd_bn": m["current_size_usd_bn"],
            "cagr_pct": m["cagr_pct"],
            "addressable_population_mn": m["addressable_population_mn"],
            "internet_users_in_segment_mn": m["internet_users_in_segment_mn"],
            "key_drivers": m["key_drivers"],
            "key_segments": m["key_segments"],
            "top_players": m["top_players"],
            "avg_arpu_inr": m["avg_arpu_inr"],
            "avg_arpu_notes": m["avg_arpu_notes"],
            "sources": m["sources"],
        }
        for m in markets
    ]


@router.post("/market-size/calculate")
async def calculate_market_size(payload: MarketSizeInput):
    markets = _load("india_markets.json")
    market = next((m for m in markets if m["id"] == payload.sector or
                   m["sector"].lower() == payload.sector.lower()), None)

    # Use provided ARPU or fall back to sector average
    arpu = payload.arpu_inr
    if arpu <= 0 and market:
        arpu = market.get("avg_arpu_inr", 5000) or 5000

    # Baseline addressable population
    if market:
        base_population_mn = market.get("internet_users_in_segment_mn") or market.get("addressable_population_mn") or 500
    else:
        base_population_mn = 500  # default: 500M internet users

    # Geography multiplier
    geo_multipliers = {
        "All India": 1.0,
        "Tier-1 Cities": 0.15,
        "Tier-2 Cities": 0.25,
        "Tier-1 + Tier-2": 0.40,
        "Rural India": 0.45,
        "Maharashtra": 0.10,
        "Karnataka": 0.07,
        "Delhi NCR": 0.08,
        "Tamil Nadu": 0.07,
    }
    geo_mult = geo_multipliers.get(payload.geography, 1.0)

    tam_population_mn = base_population_mn * geo_mult
    sam_population_mn = tam_population_mn * (payload.target_segment_pct / 100)
    som_population_mn = sam_population_mn * (payload.product_adoption_pct / 100)

    tam_cr = (tam_population_mn * 1_000_000 * arpu) / 1_00_00_000
    sam_cr = (sam_population_mn * 1_000_000 * arpu) / 1_00_00_000
    som_cr = (som_population_mn * 1_000_000 * arpu) / 1_00_00_000

    return {
        "sector": payload.sector,
        "geography": payload.geography,
        "arpu_inr": arpu,
        "tam": {
            "population_mn": round(tam_population_mn, 1),
            "revenue_cr": round(tam_cr, 0),
            "label": "Total Addressable Market",
            "description": f"All {payload.geography} users who could potentially use a product in {payload.sector}",
        },
        "sam": {
            "population_mn": round(sam_population_mn, 2),
            "revenue_cr": round(sam_cr, 0),
            "label": "Serviceable Addressable Market",
            "description": f"The {payload.target_segment_pct}% of TAM your product's model, pricing, and geography can serve",
        },
        "som": {
            "population_mn": round(som_population_mn, 3),
            "revenue_cr": round(som_cr, 0),
            "label": "Serviceable Obtainable Market",
            "description": f"Realistic {payload.product_adoption_pct}% of SAM you can capture in 3-5 years",
        },
        "market_context": {
            "current_market_size_usd_bn": market["current_size_usd_bn"] if market else None,
            "projected_market_size_usd_bn": market["market_size_usd_bn"] if market else None,
            "cagr_pct": market["cagr_pct"] if market else None,
            "sources": market["sources"] if market else [],
        } if market else None,
        "methodology": "TAM = total addressable population × geography multiplier × ARPU. SAM = TAM × target segment %. SOM = SAM × realistic adoption %.",
    }


# ── GST Guide ─────────────────────────────────────────────────────────────────

class GSTCalculateInput(BaseModel):
    model: str
    monthly_revenue_inr: float
    b2b_pct: float = 50.0
    export_pct: float = 0.0


@router.get("/gst/guide")
async def get_gst_guide(model: str = Query(..., description="saas | d2c | marketplace | manufacturing | export_saas")):
    guide = _load("gst_guide.json")
    if model not in guide:
        raise HTTPException(status_code=404, detail=f"Model '{model}' not found. Available: {list(guide.keys())}")
    return guide[model]


@router.get("/gst/models")
async def list_gst_models():
    guide = _load("gst_guide.json")
    return [
        {"id": k, "name": v["model"], "headline_rate": v["headline_rate"]}
        for k, v in guide.items()
    ]


@router.post("/gst/calculate")
async def calculate_gst(payload: GSTCalculateInput):
    guide = _load("gst_guide.json")
    model_data = guide.get(payload.model)
    if not model_data:
        raise HTTPException(status_code=404, detail=f"Model '{payload.model}' not found.")

    rev = payload.monthly_revenue_inr
    b2b_pct = min(max(payload.b2b_pct, 0), 100)
    export_pct = min(max(payload.export_pct, 0), 100)
    domestic_pct = 100 - export_pct

    gst_rate = 0.0
    if payload.model in ("saas", "marketplace", "manufacturing", "hrtech"):
        gst_rate = 0.18
    elif payload.model == "d2c":
        gst_rate = 0.12  # blended assumption
    elif payload.model == "export_saas":
        gst_rate = 0.0  # zero-rated

    domestic_rev = rev * (domestic_pct / 100)
    export_rev = rev * (export_pct / 100)

    gst_collected = domestic_rev * gst_rate
    # Rough ITC estimate: assume 20% of domestic expenses have ITC
    estimated_itc = domestic_rev * 0.05
    net_gst_liability = max(0, gst_collected - estimated_itc)
    effective_rate = (net_gst_liability / rev * 100) if rev > 0 else 0

    return {
        "model": payload.model,
        "monthly_revenue_inr": rev,
        "domestic_revenue_inr": round(domestic_rev, 2),
        "export_revenue_inr": round(export_rev, 2),
        "gst_rate_pct": gst_rate * 100,
        "gst_collected_inr": round(gst_collected, 2),
        "estimated_itc_inr": round(estimated_itc, 2),
        "net_gst_liability_inr": round(net_gst_liability, 2),
        "effective_gst_rate_pct": round(effective_rate, 2),
        "annual_gst_liability_inr": round(net_gst_liability * 12, 2),
        "note": "ITC estimate is approximate (assumes 5% of revenue in GST-claimable inputs). Consult a CA for exact figures.",
        "filing_deadlines": model_data.get("compliance_calendar", {}),
    }


# ── Salary Benchmarks ─────────────────────────────────────────────────────────

@router.get("/salary-benchmarks")
async def get_salary_benchmarks(
    function: str = Query(None, description="Engineering | Product | Business | Design | Leadership"),
    level: str = Query(None),
    city: str = Query(None, description="bengaluru | mumbai | delhi_ncr | hyderabad | pune"),
    stage: str = Query(None, description="pre_seed | seed | series_a"),
):
    data = _load("salary_benchmarks.json")
    roles = data.get("roles", [])

    if function:
        roles = [r for r in roles if r.get("function", "").lower() == function.lower()]
    if level:
        roles = [r for r in roles if level.lower() in r.get("level", "").lower()]

    # If city and stage specified, flatten to just that city+stage data per role
    if city and stage:
        result = []
        for r in roles:
            city_data = r.get("cities", {}).get(city, {})
            stage_data = city_data.get(stage, {})
            if stage_data:
                result.append({
                    "id": r["id"],
                    "title": r["title"],
                    "function": r["function"],
                    "level": r["level"],
                    "esop_typical_range": r.get("esop_typical_range", ""),
                    "esop_notes": r.get("esop_notes", ""),
                    "hiring_tips": r.get("hiring_tips", ""),
                    "city": city,
                    "stage": stage,
                    **stage_data,
                })
        return {"roles": result, "city": city, "stage": stage, "total": len(result), "meta": {k: v for k, v in data.items() if k != "roles"}}

    return {
        "roles": roles,
        "total": len(roles),
        "meta": {k: v for k, v in data.items() if k != "roles"}
    }


@router.get("/salary-benchmarks/roles")
async def list_salary_roles():
    data = _load("salary_benchmarks.json")
    roles = data.get("roles", [])
    return {
        "roles": [{"id": r["id"], "title": r["title"], "function": r["function"], "level": r["level"]} for r in roles],
        "functions": sorted(list(set(r["function"] for r in roles))),
        "cities": ["bengaluru", "mumbai", "delhi_ncr", "hyderabad", "pune"],
        "stages": ["pre_seed", "seed", "series_a"],
    }


# ── Deal Terms Benchmarks ─────────────────────────────────────────────────────

@router.get("/deal-terms")
async def get_deal_terms(stage: str = Query(None, description="pre_seed | seed | series_a")):
    data = _load("deal_terms_benchmarks.json")
    if stage:
        if stage not in data.get("stages", {}):
            raise HTTPException(status_code=404, detail=f"Stage '{stage}' not found. Use: pre_seed, seed, series_a")
        return {
            "stage": stage,
            "data": data["stages"][stage],
            "glossary": data.get("glossary", {}),
            "negotiation_tips": data.get("negotiation_tips", []),
        }
    return data


# ── Startup Programs ──────────────────────────────────────────────────────────

@router.get("/startup-programs")
async def get_startup_programs(
    category: str = Query(None),
    search: str = Query(None),
    india_only: bool = Query(False),
    sort_by: str = Query("value", description="value | name | difficulty"),
):
    programs = _load("startup_programs.json")

    if india_only:
        programs = [p for p in programs if p.get("india_available", True)]
    if category:
        programs = [p for p in programs if p.get("category", "").lower() == category.lower()]
    if search:
        q = search.lower()
        programs = [p for p in programs if q in p.get("name", "").lower() or q in p.get("provider", "").lower() or q in " ".join(p.get("tags", [])).lower()]

    if sort_by == "value":
        programs = sorted(programs, key=lambda p: p.get("total_value_usd", 0), reverse=True)
    elif sort_by == "name":
        programs = sorted(programs, key=lambda p: p.get("name", ""))
    elif sort_by == "difficulty":
        order = {"Easy": 0, "Medium": 1, "Hard": 2}
        programs = sorted(programs, key=lambda p: order.get(p.get("difficulty_to_get", "Medium"), 1))

    categories = sorted(list(set(p.get("category", "") for p in _load("startup_programs.json") if p.get("category"))))
    total_value = sum(p.get("total_value_usd", 0) for p in programs)

    return {
        "programs": programs,
        "total": len(programs),
        "total_value_usd": total_value,
        "categories": categories,
    }


# ── Communities ───────────────────────────────────────────────────────────────

@router.get("/communities")
async def get_communities(
    type: str = Query(None),
    focus: str = Query(None),
    city: str = Query(None),
    search: str = Query(None),
    is_free: bool = Query(None),
):
    communities = _load("communities.json")

    if type:
        communities = [c for c in communities if type.lower() in c.get("type", "").lower()]
    if focus:
        communities = [c for c in communities if any(focus.lower() in f.lower() for f in c.get("focus_areas", []))]
    if city:
        communities = [c for c in communities if city.lower() in " ".join(c.get("cities", [])).lower() or c.get("geography", "") == "Pan-India"]
    if search:
        q = search.lower()
        communities = [c for c in communities if q in c.get("name", "").lower() or q in c.get("description", "").lower() or q in " ".join(c.get("tags", [])).lower()]
    if is_free is not None:
        communities = [c for c in communities if c.get("is_free") == is_free]

    all_comms = _load("communities.json")
    types = sorted(list(set(c.get("type", "") for c in all_comms if c.get("type"))))
    focus_areas = sorted(list(set(f for c in all_comms for f in c.get("focus_areas", []))))

    return {
        "communities": communities,
        "total": len(communities),
        "types": types,
        "focus_areas": focus_areas[:20],
    }
