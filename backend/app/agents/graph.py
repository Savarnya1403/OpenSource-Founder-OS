from __future__ import annotations
"""LangGraph multi-agent orchestration graph for OpenFounder OS."""
from langgraph.graph import StateGraph, END
from app.agents.state import OpenFounderState
from app.agents.nodes.supervisor import supervisor_node
from app.agents.nodes.mentor import mentor_node
from app.agents.nodes.schemes import schemes_node
from app.agents.nodes.researcher import researcher_node
from app.agents.nodes.pitch import pitch_node


def route_from_supervisor(state: OpenFounderState) -> str:
    return state.get("next_agent", "mentor")


def build_graph():
    g = StateGraph(OpenFounderState)

    g.add_node("supervisor", supervisor_node)
    g.add_node("mentor", mentor_node)
    g.add_node("schemes", schemes_node)
    g.add_node("researcher", researcher_node)
    g.add_node("pitch", pitch_node)

    g.set_entry_point("supervisor")

    g.add_conditional_edges(
        "supervisor",
        route_from_supervisor,
        {
            "mentor": "mentor",
            "schemes": "schemes",
            "researcher": "researcher",
            "pitch": "pitch",
        },
    )

    g.add_edge("mentor", END)
    g.add_edge("schemes", END)
    g.add_edge("researcher", END)
    g.add_edge("pitch", END)

    return g.compile()


# Singleton compiled graph
_graph = None


def get_graph():
    global _graph
    if _graph is None:
        _graph = build_graph()
    return _graph
