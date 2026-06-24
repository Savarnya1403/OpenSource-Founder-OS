from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    agent: Optional[str] = None
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    startup_context: Optional[dict] = None


class ChatStreamChunk(BaseModel):
    type: Literal["token", "agent_switch", "done", "error"]
    content: str
    agent: Optional[str] = None
    session_id: Optional[str] = None


class StartupProfile(BaseModel):
    name: Optional[str] = None
    stage: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None
    team_size: Optional[int] = None
    revenue: Optional[str] = None
    dpiit_registered: Optional[bool] = None
    entity_type: Optional[str] = None
    target_market: Optional[str] = None
