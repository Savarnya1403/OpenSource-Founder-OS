from __future__ import annotations
from typing import Annotated, Any
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages
from langchain_core.messages import AnyMessage


class OpenFounderState(TypedDict):
    messages: Annotated[list[AnyMessage], add_messages]
    active_agent: str
    startup_profile: dict[str, Any]
    retrieved_context: str
    next_agent: str
    llm_config: dict[str, Any]  # {"provider": ..., "api_key": ..., "model": ...}
