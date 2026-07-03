"""
Intel routes — real-time market intelligence.
Sources: Hacker News (Algolia API), Reddit JSON API, Google News RSS.
All sources are free, no authentication required.
"""
from __future__ import annotations
import asyncio
import json
import re
import time
from datetime import datetime, timezone
from typing import Optional

import httpx
import feedparser
from fastapi import APIRouter, Query

router = APIRouter(prefix="/intel", tags=["intel"])

# ─── In-memory cache (TTL: 10 minutes) ──────────────────────────────────────
_cache: dict[str, dict] = {}
CACHE_TTL = 10 * 60  # seconds


def _get_cache(key: str) -> Optional[dict]:
    entry = _cache.get(key)
    if not entry:
        return None
    if time.time() - entry["ts"] > CACHE_TTL:
        return None
    return entry["data"]


def _set_cache(key: str, data: dict):
    _cache[key] = {"data": data, "ts": time.time()}


# ─── NLP: Pain-point keyword extraction ──────────────────────────────────────

PAIN_KEYWORDS = [
    "frustrating", "broken", "annoying", "hate", "slow", "expensive",
    "complicated", "confusing", "doesn't work", "can't", "impossible",
    "terrible", "awful", "worst", "waste", "useless", "hard to",
    "difficult", "no solution", "missing", "lack of", "wish",
    "problem with", "issue with", "bug", "error", "fail", "failed",
    "overpriced", "support is bad", "terrible ux", "bad ux", "clunky",
    "outdated", "unreliable", "too complex", "not intuitive",
]

POSITIVE_KEYWORDS = [
    "amazing", "great", "awesome", "love", "fantastic", "excellent",
    "solved", "recommend", "best", "perfect", "easy to use",
    "game changer", "highly recommend",
]


def classify_sentiment(text: str) -> str:
    text_lower = text.lower()
    pain_hits    = sum(1 for kw in PAIN_KEYWORDS if kw in text_lower)
    positive_hits = sum(1 for kw in POSITIVE_KEYWORDS if kw in text_lower)
    if pain_hits > positive_hits and pain_hits >= 1:
        return "negative"
    if positive_hits > pain_hits and positive_hits >= 1:
        return "positive"
    return "neutral"


def extract_pain_points(items: list[dict], max_points: int = 8) -> list[str]:
    """Simple frequency-based pain point extraction."""
    combined = " ".join(i.get("title", "") for i in items if i.get("sentiment") == "negative")
    phrases = []
    for kw in PAIN_KEYWORDS:
        if kw in combined.lower():
            ctx = re.findall(rf"\b[\w\s]{{0,20}}{re.escape(kw)}[\w\s]{{0,20}}\b", combined, re.I)
            if ctx:
                phrases.append(ctx[0].strip().capitalize())
    seen = set()
    unique = []
    for p in phrases:
        key = p[:30].lower()
        if key not in seen:
            seen.add(key)
            unique.append(p)
    return unique[:max_points]


# ─── Hacker News via Algolia ─────────────────────────────────────────────────

async def fetch_hn(query: str, limit: int = 20) -> list[dict]:
    url = "https://hn.algolia.com/api/v1/search"
    params = {
        "query": query,
        "tags": "story",
        "hitsPerPage": limit,
        "attributesToRetrieve": "objectID,title,url,points,num_comments,created_at,author",
    }
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(url, params=params)
            r.raise_for_status()
            hits = r.json().get("hits", [])
    except Exception:
        return []

    results = []
    for h in hits:
        if not h.get("title"):
            continue
        text = h.get("title", "")
        results.append({
            "id": f"hn-{h['objectID']}",
            "source": "hackernews",
            "title": h["title"],
            "url": h.get("url") or f"https://news.ycombinator.com/item?id={h['objectID']}",
            "score": h.get("points", 0),
            "comments": h.get("num_comments", 0),
            "timestamp": h.get("created_at", datetime.now(timezone.utc).isoformat()),
            "author": h.get("author"),
            "sentiment": classify_sentiment(text),
            "pain_points": [kw.capitalize() for kw in PAIN_KEYWORDS if kw in text.lower()][:3],
        })
    return results


# ─── Reddit via public JSON API ───────────────────────────────────────────────

SUBREDDIT_MAP = {
    "SaaS": ["SaaS", "startups", "Entrepreneur"],
    "FinTech": ["fintech", "startups", "india_finance"],
    "EdTech": ["edtech", "startups", "india"],
    "HealthTech": ["healthIT", "startups", "HealthcareIT"],
    "AI/ML": ["MachineLearning", "artificial", "LanguageModels"],
    "D2C": ["ecommerce", "dtc", "startups"],
    "AgriTech": ["agriculture", "startups", "india"],
    "DeepTech": ["hardware", "robotics", "startups"],
    "Climate": ["ClimateChange", "sustainability", "startups"],
    "Logistics": ["logistics", "supplychain", "startups"],
    "Gaming": ["gamedev", "indiegaming", "startups"],
    "B2B": ["B2B", "SaaS", "startups"],
}

HEADERS = {"User-Agent": "OpenFounderOS/1.0 Research Bot (educational use)"}


async def fetch_reddit(query: str, subreddits: list[str], limit: int = 15) -> list[dict]:
    results = []
    async with httpx.AsyncClient(timeout=8, headers=HEADERS) as client:
        for sub in subreddits[:2]:
            try:
                url = f"https://www.reddit.com/r/{sub}/search.json"
                r = await client.get(url, params={"q": query, "sort": "hot", "limit": limit, "t": "week"})
                r.raise_for_status()
                posts = r.json().get("data", {}).get("children", [])
                for p in posts:
                    d = p.get("data", {})
                    if not d.get("title") or d.get("over_18"):
                        continue
                    text = d.get("title", "") + " " + d.get("selftext", "")[:200]
                    ts = datetime.fromtimestamp(d.get("created_utc", time.time()), tz=timezone.utc)
                    results.append({
                        "id": f"reddit-{d['id']}",
                        "source": "reddit",
                        "title": d["title"],
                        "url": f"https://reddit.com{d.get('permalink', '')}",
                        "score": d.get("score", 0),
                        "comments": d.get("num_comments", 0),
                        "timestamp": ts.isoformat(),
                        "author": d.get("author"),
                        "subreddit": sub,
                        "sentiment": classify_sentiment(text),
                        "pain_points": [kw.capitalize() for kw in PAIN_KEYWORDS if kw in text.lower()][:3],
                    })
            except Exception:
                continue
    return results


# ─── Google News RSS ──────────────────────────────────────────────────────────

async def fetch_news(query: str, limit: int = 15) -> list[dict]:
    rss_url = f"https://news.google.com/rss/search?q={query}+startup+India&hl=en-IN&gl=IN&ceid=IN:en"
    try:
        async with httpx.AsyncClient(timeout=8) as client:
            r = await client.get(rss_url)
            r.raise_for_status()
            feed_text = r.text
    except Exception:
        return []

    try:
        feed = feedparser.parse(feed_text)
    except Exception:
        return []

    results = []
    for entry in feed.entries[:limit]:
        title = entry.get("title", "")
        if not title:
            continue
        try:
            pub = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
        except Exception:
            pub = datetime.now(timezone.utc)

        results.append({
            "id": f"news-{abs(hash(title))}",
            "source": "news",
            "title": title,
            "url": entry.get("link", ""),
            "timestamp": pub.isoformat(),
            "sentiment": classify_sentiment(title),
            "pain_points": [kw.capitalize() for kw in PAIN_KEYWORDS if kw in title.lower()][:2],
        })
    return results


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("/feed")
async def get_intel_feed(
    topic: str = Query("SaaS"),
    limit: int = Query(50, le=100),
):
    cache_key = f"feed:{topic}"
    cached = _get_cache(cache_key)
    if cached:
        return {**cached, "cached": True}

    subs = SUBREDDIT_MAP.get(topic, ["startups", "SaaS"])
    query = f"{topic} startup"

    hn_items, reddit_items, news_items = await asyncio.gather(
        fetch_hn(query, 20),
        fetch_reddit(query, subs, 15),
        fetch_news(topic, 15),
        return_exceptions=True,
    )

    all_items: list[dict] = []
    for src in [hn_items, reddit_items, news_items]:
        if isinstance(src, list):
            all_items.extend(src)

    # Sort by score desc, then by timestamp
    all_items.sort(key=lambda x: (x.get("score") or 0), reverse=True)
    all_items = all_items[:limit]

    pain_points = extract_pain_points(all_items)

    result = {
        "items": all_items,
        "cached": False,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "pain_points_summary": pain_points,
        "topic": topic,
    }
    _set_cache(cache_key, result)
    return result


# ─── SEC / Public market benchmarks ──────────────────────────────────────────

# Curated from public annual reports, NSE filings & SEC EDGAR (FY 2024/2025)
_BENCHMARKS = [
    # Indian tech companies (NSE/BSE listed)
    {"ticker": "FRESH", "name": "Freshworks",     "sector": "SaaS",      "revenue_growth_yoy": 22.0, "gross_margin": 83.5, "arr_usd_m": 696,   "nrr": 108, "ev_revenue": 7.2,  "exchange": "NASDAQ", "fiscal_year": "FY2024", "source_url": "https://investors.freshworks.com"},
    {"ticker": "INFY",  "name": "Infosys",         "sector": "SaaS",      "revenue_growth_yoy": 4.2,  "gross_margin": 31.0, "arr_usd_m": 18562, "nrr": None, "ev_revenue": 3.5, "exchange": "NSE",    "fiscal_year": "FY2024", "source_url": "https://www.infosys.com/investors"},
    {"ticker": "NAUKRI", "name": "Info Edge",      "sector": "SaaS",      "revenue_growth_yoy": 14.5, "gross_margin": 68.0, "arr_usd_m": 250,   "nrr": None, "ev_revenue": 12.5,"exchange": "NSE",    "fiscal_year": "FY2024", "source_url": "https://www.infoedge.in/investors"},
    {"ticker": "ZOMATO", "name": "Zomato",         "sector": "D2C",       "revenue_growth_yoy": 73.0, "gross_margin": 31.5, "arr_usd_m": 1400,  "nrr": None, "ev_revenue": 8.8, "exchange": "NSE",    "fiscal_year": "FY2024", "source_url": "https://ir.zomato.com"},
    {"ticker": "PAYTM",  "name": "Paytm",          "sector": "FinTech",   "revenue_growth_yoy": 25.0, "gross_margin": 53.0, "arr_usd_m": 1200,  "nrr": None, "ev_revenue": 2.1, "exchange": "NSE",    "fiscal_year": "FY2024", "source_url": "https://ir.paytm.com"},
    {"ticker": "DELHIVERY","name": "Delhivery",    "sector": "Logistics", "revenue_growth_yoy": 14.0, "gross_margin": 23.0, "arr_usd_m": 990,   "nrr": None, "ev_revenue": 2.4, "exchange": "NSE",    "fiscal_year": "FY2024", "source_url": "https://www.delhivery.com/investors"},
    {"ticker": "NYKAA",  "name": "Nykaa (FSN)",    "sector": "D2C",       "revenue_growth_yoy": 22.0, "gross_margin": 42.5, "arr_usd_m": 725,   "nrr": None, "ev_revenue": 7.5, "exchange": "NSE",    "fiscal_year": "FY2024", "source_url": "https://ir.nykaa.com"},
    {"ticker": "POLICYBZR","name": "PolicyBazaar", "sector": "FinTech",   "revenue_growth_yoy": 44.0, "gross_margin": 38.0, "arr_usd_m": 480,   "nrr": None, "ev_revenue": 6.8, "exchange": "NSE",    "fiscal_year": "FY2024", "source_url": "https://www.pbfintech.in/investors"},
    {"ticker": "HAPPIEST","name": "Happiest Minds","sector": "SaaS",      "revenue_growth_yoy": 18.0, "gross_margin": 34.0, "arr_usd_m": 220,   "nrr": None, "ev_revenue": 4.2, "exchange": "NSE",    "fiscal_year": "FY2024", "source_url": "https://www.happiestminds.com/investors"},
    {"ticker": "MAPMYIND","name": "MapmyIndia",    "sector": "SaaS",      "revenue_growth_yoy": 32.0, "gross_margin": 70.0, "arr_usd_m": 80,    "nrr": None, "ev_revenue": 18.0,"exchange": "NSE",    "fiscal_year": "FY2024", "source_url": "https://www.mapmyindia.com/investors"},
    # Global SaaS benchmarks (NASDAQ)
    {"ticker": "CRM",  "name": "Salesforce",     "sector": "SaaS",   "revenue_growth_yoy": 11.0, "gross_margin": 77.0, "arr_usd_m": 34857, "nrr": 113, "ev_revenue": 7.8, "exchange": "NYSE",   "fiscal_year": "FY2025", "source_url": "https://investor.salesforce.com"},
    {"ticker": "SPOT",  "name": "Spotify",        "sector": "D2C",    "revenue_growth_yoy": 20.0, "gross_margin": 28.8, "arr_usd_m": 15673, "nrr": None,"ev_revenue": 3.2, "exchange": "NYSE",   "fiscal_year": "FY2024", "source_url": "https://investors.spotify.com"},
    {"ticker": "SHOP",  "name": "Shopify",        "sector": "SaaS",   "revenue_growth_yoy": 24.0, "gross_margin": 51.0, "arr_usd_m": 7060,  "nrr": None,"ev_revenue": 13.0,"exchange": "NYSE",   "fiscal_year": "FY2024", "source_url": "https://investors.shopify.com"},
    {"ticker": "HUB",   "name": "HubSpot",        "sector": "SaaS",   "revenue_growth_yoy": 23.0, "gross_margin": 85.0, "arr_usd_m": 2600,  "nrr": 103,"ev_revenue": 9.5,  "exchange": "NYSE",   "fiscal_year": "FY2024", "source_url": "https://ir.hubspot.com"},
    {"ticker": "MDB",   "name": "MongoDB",        "sector": "SaaS",   "revenue_growth_yoy": 22.0, "gross_margin": 74.5, "arr_usd_m": 1930,  "nrr": 118,"ev_revenue": 9.0,  "exchange": "NASDAQ", "fiscal_year": "FY2025", "source_url": "https://investors.mongodb.com"},
]


def _rule40(b: dict) -> float:
    # Approximate EBITDA margin from sector benchmarks since exact data varies
    ebitda_approx = {
        "SaaS": 8, "FinTech": 5, "EdTech": -5, "HealthTech": -2,
        "Logistics": -3, "D2C": 2, "E-commerce": -8,
    }
    margin = ebitda_approx.get(b.get("sector", "SaaS"), 0)
    return b["revenue_growth_yoy"] + margin


@router.get("/benchmarks")
async def get_benchmarks(
    sector: str | None = Query(None),
):
    cache_key = f"benchmarks:{sector or 'all'}"
    cached = _get_cache(cache_key)
    if cached:
        return {**cached, "cached": True}

    data = [
        {**b, "rule_of_40": _rule40(b)}
        for b in _BENCHMARKS
        if not sector or b["sector"].lower() == sector.lower()
    ]

    result = {
        "benchmarks": data,
        "cached": False,
        "updated_at": "2025-07-01",
        "note": "Data sourced from public SEC EDGAR filings, NSE/BSE annual reports, and company investor relations pages.",
    }
    _set_cache(cache_key, result)
    return result


@router.get("/health")
async def intel_health():
    return {"status": "ok", "cache_keys": list(_cache.keys())}
