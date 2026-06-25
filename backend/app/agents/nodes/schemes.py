from __future__ import annotations
"""Schemes Agent — matches government grants/schemes to the startup."""
from langchain_core.messages import SystemMessage, AIMessage
from app.agents.state import OpenFounderState
from app.rag import get_rag
from app.models.scheme import SchemeMatchRequest
from app.core.llm_factory import build_llm_from_state
import json

SCHEMES_SYSTEM = """You are OpenFounder OS's Government Schemes Specialist with encyclopaedic knowledge of Indian central and state government schemes for startups, MSMEs, and innovators.

You have retrieved relevant schemes from the database (shown below). Your job is to:
1. Present the most relevant schemes clearly with key details
2. Explain WHY each scheme is relevant to this specific founder
3. Give actionable next steps for applying
4. Highlight any gotchas or common mistakes in applications
5. Suggest the application priority order

Format each scheme with:
**[Scheme Name]** — [Ministry/Agency]
- What you get: [benefits]
- Eligibility: [key requirements]
- Apply here: [URL]
- Why it fits you: [personalised reason]
- Next step: [specific action]

Be concise but thorough. Always end with a prioritised action list."""


def build_schemes_system(user_query: str, profile: dict) -> str:
    """Return a fully-hydrated system prompt with RAG-retrieved schemes injected."""
    rag = get_rag()
    sector = profile.get("sector") or _extract_sector(user_query)
    stage = profile.get("startup_stage") or "Early Revenue"
    match_req = SchemeMatchRequest(
        sector=sector, stage=stage,
        entity_type=profile.get("entity_type"),
        city=profile.get("city"),
        dpiit_registered=profile.get("dpiit_registered"),
        description=user_query,
    )
    matched = rag.match_startup(match_req, limit=6)
    if not matched:
        schemes_context = "No highly specific schemes found. Showing broadly applicable schemes.\n"
        for s in rag.search("startup grant fund India", limit=5):
            schemes_context += _format_scheme_brief(s)
    else:
        schemes_context = f"Found {len(matched)} relevant schemes:\n\n"
        for s in matched:
            schemes_context += _format_scheme_brief(s)
    profile_ctx = ""
    if profile:
        profile_ctx = "\n[Startup Profile]\n" + "\n".join(f"- {k}: {v}" for k, v in profile.items() if v)
    return f"{SCHEMES_SYSTEM}\n\n[Retrieved Schemes from Database]\n{schemes_context}{profile_ctx}"


def schemes_node(state: OpenFounderState) -> dict:
    rag = get_rag()
    profile = state.get("startup_profile", {})
    last_msg = state["messages"][-1]
    user_query = last_msg.content if hasattr(last_msg, "content") else str(last_msg)

    # Build match request from profile + user query
    sector = profile.get("sector") or _extract_sector(user_query)
    stage = profile.get("startup_stage") or "Early Revenue"

    match_req = SchemeMatchRequest(
        sector=sector,
        stage=stage,
        entity_type=profile.get("entity_type"),
        city=profile.get("city"),
        dpiit_registered=profile.get("dpiit_registered"),
        description=user_query,
    )

    matched = rag.match_startup(match_req, limit=6)

    if not matched:
        schemes_context = "No highly specific schemes found. Showing broadly applicable schemes.\n"
        general = rag.search("startup grant fund India", limit=5)
        for s in general:
            schemes_context += _format_scheme_brief(s)
    else:
        schemes_context = f"Found {len(matched)} relevant schemes:\n\n"
        for s in matched:
            schemes_context += _format_scheme_brief(s)

    llm = build_llm_from_state(state, max_tokens=2048, temperature=0.3)

    profile_ctx = ""
    if profile:
        profile_ctx = "\n[Startup Profile]\n" + "\n".join(f"- {k}: {v}" for k, v in profile.items() if v)

    system_with_context = f"{SCHEMES_SYSTEM}\n\n[Retrieved Schemes from Database]\n{schemes_context}{profile_ctx}"
    messages = [SystemMessage(content=system_with_context)] + list(state["messages"])
    response = llm.invoke(messages)

    return {"messages": [response], "active_agent": "schemes", "retrieved_context": schemes_context}


def _format_scheme_brief(s) -> str:
    score_str = f" (relevance: {s.relevance_score:.2f})" if s.relevance_score else ""
    return (
        f"### {s.name}{score_str}\n"
        f"Ministry: {s.ministry} | Type: {s.type}\n"
        f"Funding: {s.funding_amount or 'Non-monetary'}\n"
        f"Benefits: {', '.join(s.benefits[:3])}\n"
        f"Sectors: {', '.join(s.sectors[:3])}\n"
        f"Stages: {', '.join(s.stages)}\n"
        f"URL: {s.application_url or 'N/A'}\n\n"
    )


def _extract_sector(text: str) -> str:
    text_lower = text.lower()
    sector_map = {
        "ai": "Technology", "machine learning": "Technology", "saas": "Technology",
        "software": "Technology", "app": "Technology", "tech": "Technology",
        "health": "Healthcare", "medical": "Healthcare", "pharma": "Healthcare",
        "agri": "Agriculture", "farm": "Agriculture", "food": "Agriculture",
        "finance": "FinTech", "fintech": "FinTech", "payment": "FinTech",
        "edu": "Education", "edtech": "Education", "learning": "Education",
        "bio": "Biotechnology", "biotech": "Biotechnology",
        "manufact": "Manufacturing", "hardware": "Manufacturing",
        "energy": "Energy", "solar": "Energy", "climate": "Energy",
    }
    for keyword, sector in sector_map.items():
        if keyword in text_lower:
            return sector
    return "Technology"
