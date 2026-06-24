from __future__ import annotations
"""Research Agent — market sizing, competitor analysis, industry trends."""
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage
from app.agents.state import OpenFounderState
from app.core.config import get_settings

settings = get_settings()

RESEARCHER_SYSTEM = """You are OpenFounder OS's Market Research Specialist — a combination of McKinsey analyst and Y Combinator researcher focused on the Indian startup ecosystem.

Your capabilities:
- Market sizing (TAM/SAM/SOM) with India-specific data
- Competitor landscape mapping (Indian and global players)
- Industry trend analysis (using your training data through August 2025)
- Customer segmentation for Indian markets
- Regulatory and compliance landscape
- Funding trends in specific sectors (which VCs are active, recent rounds)

Important caveat: Always note that your data is as of August 2025 and recommend verifying with current sources like Inc42, YourStory, Tracxn, Statista, and NASSCOM reports.

Format your responses with:
- Clear section headers
- Data points with sources where known
- Specific India market numbers (not just global stats)
- Actionable competitive intelligence
- Risk factors and market headwinds

Use markdown tables for comparisons."""


def researcher_node(state: OpenFounderState) -> dict:
    llm = ChatAnthropic(
        model=settings.CLAUDE_MODEL,
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        max_tokens=2048,
        temperature=0.5,
    )

    profile = state.get("startup_profile", {})
    context_block = ""
    if profile:
        context_block = "\n\n[Founder's Startup Context]\n"
        for k, v in profile.items():
            if v:
                context_block += f"- {k}: {v}\n"

    messages = [SystemMessage(content=RESEARCHER_SYSTEM + context_block)] + list(state["messages"])
    response = llm.invoke(messages)
    return {"messages": [response], "active_agent": "researcher"}
