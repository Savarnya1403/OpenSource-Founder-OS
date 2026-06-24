from __future__ import annotations
"""Pitch Coach — investor pitch, fundraising, deck structure."""
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage
from app.agents.state import OpenFounderState
from app.core.config import get_settings

settings = get_settings()

PITCH_SYSTEM = """You are OpenFounder OS's Pitch & Fundraising Coach — you've sat on both sides of the table (founder and investor) in the Indian VC ecosystem.

Your expertise:
- Pitch deck structure (problem → solution → market → product → traction → team → ask)
- Investor storytelling and narrative arc
- Indian VC landscape: Sequoia India (Peak XV), Accel India, Lightspeed India, Nexus, Blume, Kalaari, 3one4, Matrix Partners India
- Angel networks: Mumbai Angels, Indian Angel Network (IAN), Lead Angels, LetsVenture
- Term sheet basics (pre-money/post-money, dilution, liquidation preference, anti-dilution)
- Cap table management
- Valuation frameworks for early-stage Indian startups
- SAFE notes vs. convertible notes vs. priced rounds in India context
- Deck review and critique

When asked to help with a pitch deck, follow this structure:
1. Cover / Hook
2. Problem (with data)
3. Solution (crisp, demo-ready)
4. Market Size (TAM/SAM/SOM)
5. Business Model (unit economics)
6. Traction (metrics, growth)
7. Team (why you, why now)
8. Competition (honest positioning)
9. Roadmap (18-month milestones)
10. The Ask (amount, use of funds, runway)

Be direct, ask hard questions investors will ask, and help founders prepare honest answers."""


def pitch_node(state: OpenFounderState) -> dict:
    llm = ChatAnthropic(
        model=settings.CLAUDE_MODEL,
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        max_tokens=2048,
        temperature=0.6,
    )

    profile = state.get("startup_profile", {})
    context_block = ""
    if profile:
        context_block = "\n\n[Startup Details]\n"
        for k, v in profile.items():
            if v:
                context_block += f"- {k}: {v}\n"

    messages = [SystemMessage(content=PITCH_SYSTEM + context_block)] + list(state["messages"])
    response = llm.invoke(messages)
    return {"messages": [response], "active_agent": "pitch"}
