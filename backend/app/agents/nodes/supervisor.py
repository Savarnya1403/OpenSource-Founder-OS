from __future__ import annotations
"""Supervisor: classifies intent and routes to the right specialist agent."""
from langchain_core.messages import SystemMessage, HumanMessage
from app.agents.state import OpenFounderState
from app.core.llm_factory import build_llm_from_state

SUPERVISOR_SYSTEM = """You are the OpenFounder OS supervisor. Your only job is to classify the user's intent and output EXACTLY one word — the name of the agent to handle the request.

Agents available:
- mentor      → General startup advice, strategy, validation, team, growth, business model, hiring, culture, product-market fit
- schemes     → Government grants, schemes, funding schemes, incentives, DPIIT recognition, Startup India, MSME schemes, SIDBI, NABARD, BIRAC, MeitY, DST
- researcher  → Market research, competitor analysis, industry data, market sizing, trends, benchmarks
- pitch       → Pitch deck, investor pitch, fundraising narrative, term sheet, cap table, valuation, investor readiness

Rules:
- Output ONLY the agent name (one word, lowercase)
- If unsure, output: mentor
- Never output anything else"""


def supervisor_node(state: OpenFounderState) -> dict:
    llm = build_llm_from_state(state, max_tokens=10, temperature=0)

    last_message = state["messages"][-1]
    user_text = last_message.content if hasattr(last_message, "content") else str(last_message)

    response = llm.invoke([
        SystemMessage(content=SUPERVISOR_SYSTEM),
        HumanMessage(content=user_text),
    ])

    agent = response.content.strip().lower()
    if agent not in {"mentor", "schemes", "researcher", "pitch"}:
        agent = "mentor"

    return {"active_agent": agent, "next_agent": agent}
