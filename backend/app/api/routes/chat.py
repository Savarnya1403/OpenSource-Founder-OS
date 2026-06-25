from __future__ import annotations
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.agents.graph import get_graph
from app.agents.state import OpenFounderState
from app.models.chat import ChatRequest
from app.api.deps import get_optional_user
from app.core.config import get_settings
from app.core.llm_factory import PROVIDERS, build_llm_from_state

# Agent system prompts — imported at module level so they're available without LangGraph
from app.agents.nodes.supervisor import SUPERVISOR_SYSTEM
from app.agents.nodes.mentor import MENTOR_SYSTEM
from app.agents.nodes.researcher import RESEARCHER_SYSTEM
from app.agents.nodes.pitch import PITCH_SYSTEM
from app.agents.nodes.schemes import build_schemes_system

router = APIRouter(prefix="/chat", tags=["chat"])
settings = get_settings()

AGENT_SYSTEMS = {
    "mentor": (MENTOR_SYSTEM, 0.7),
    "researcher": (RESEARCHER_SYSTEM, 0.5),
    "pitch": (PITCH_SYSTEM, 0.6),
}

# In-memory session store (use Redis in production)
_sessions: dict[str, list] = {}


@router.get("/providers")
async def list_providers():
    """Return supported LLM providers and their available models."""
    return {
        "providers": [
            {
                "id": pid,
                "label": meta["label"],
                "models": meta["models"],
                "default_model": meta["default_model"],
            }
            for pid, meta in PROVIDERS.items()
        ]
    }


def _extract_token(chunk) -> str:
    """Extract text from an AIMessageChunk regardless of provider format."""
    if not hasattr(chunk, "content"):
        return ""
    raw = chunk.content
    if isinstance(raw, str):
        return raw
    if isinstance(raw, list):
        return "".join(
            item.get("text", "") if isinstance(item, dict) else str(item)
            for item in raw
        )
    return ""


def _build_llm_config(payload: ChatRequest) -> dict:
    if payload.llm_provider and payload.llm_api_key:
        return {
            "provider": payload.llm_provider,
            "api_key": payload.llm_api_key,
            "model": payload.llm_model,
        }
    return {}


def _build_profile(user, payload: ChatRequest) -> dict:
    profile: dict = {}
    if user:
        profile = {
            "startup_name": user.get("startup_name"),
            "startup_stage": user.get("startup_stage"),
            "sector": user.get("sector"),
            "city": user.get("city"),
        }
    if payload.startup_context:
        profile.update(payload.startup_context)
    return profile


@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    user: dict | None = Depends(get_optional_user),
):
    """Stream chat response via SSE — streams directly from llm.astream()."""
    llm_config = _build_llm_config(payload)
    has_user_key = bool(llm_config)
    if not has_user_key and not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="No AI provider configured. Add your API key in AI Settings.",
        )

    session_id = payload.session_id or str(uuid.uuid4())
    history = list(_sessions.get(session_id, []))
    startup_profile = _build_profile(user, payload)

    # Build a minimal state dict so build_llm_from_state works
    state_stub = {"llm_config": llm_config}

    history.append(HumanMessage(content=payload.message))

    async def event_generator():
        full_response = ""
        try:
            # ── Step 1: Supervisor (fast, non-streaming) ───────────────────
            sv_llm = build_llm_from_state(state_stub, max_tokens=20, temperature=0)
            sv_resp = await sv_llm.ainvoke([
                SystemMessage(content=SUPERVISOR_SYSTEM),
                HumanMessage(content=payload.message),
            ])
            agent = sv_resp.content.strip().lower().split()[0] if sv_resp.content.strip() else "mentor"
            if agent not in {"mentor", "schemes", "researcher", "pitch"}:
                agent = "mentor"

            yield f"data: {json.dumps({'type': 'agent_switch', 'agent': agent, 'session_id': session_id})}\n\n"

            # ── Step 2: Build system prompt ───────────────────────────────
            if agent == "schemes":
                system_content = build_schemes_system(payload.message, startup_profile)
                temperature = 0.3
            else:
                base_system, temperature = AGENT_SYSTEMS[agent]
                profile_ctx = ""
                if startup_profile:
                    profile_ctx = "\n\n[Founder's Startup Profile]\n" + "\n".join(
                        f"- {k}: {v}" for k, v in startup_profile.items() if v
                    )
                system_content = base_system + profile_ctx

            # ── Step 3: Stream tokens directly ───────────────────────────
            agent_llm = build_llm_from_state(state_stub, max_tokens=2048, temperature=temperature)
            messages = [SystemMessage(content=system_content)] + history

            async for chunk in agent_llm.astream(messages):
                token = _extract_token(chunk)
                if token:
                    full_response += token
                    yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

            # ── Save session ──────────────────────────────────────────────
            history.append(AIMessage(content=full_response))
            _sessions[session_id] = history[-20:]

            yield f"data: {json.dumps({'type': 'done', 'session_id': session_id})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/message")
async def chat_message(
    payload: ChatRequest,
    user: dict | None = Depends(get_optional_user),
):
    """Non-streaming chat — returns full response at once."""
    llm_config = _build_llm_config(payload)
    has_user_key = bool(llm_config)
    if not has_user_key and not settings.ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="No AI provider configured.")

    session_id = payload.session_id or str(uuid.uuid4())
    history = list(_sessions.get(session_id, []))
    startup_profile = _build_profile(user, payload)
    state_stub = {"llm_config": llm_config}

    history.append(HumanMessage(content=payload.message))

    # Supervisor
    sv_llm = build_llm_from_state(state_stub, max_tokens=20, temperature=0)
    sv_resp = await sv_llm.ainvoke([
        SystemMessage(content=SUPERVISOR_SYSTEM),
        HumanMessage(content=payload.message),
    ])
    agent = sv_resp.content.strip().lower().split()[0] if sv_resp.content.strip() else "mentor"
    if agent not in {"mentor", "schemes", "researcher", "pitch"}:
        agent = "mentor"

    if agent == "schemes":
        system_content = build_schemes_system(payload.message, startup_profile)
        temperature = 0.3
    else:
        base_system, temperature = AGENT_SYSTEMS[agent]
        profile_ctx = ""
        if startup_profile:
            profile_ctx = "\n\n[Founder's Startup Profile]\n" + "\n".join(
                f"- {k}: {v}" for k, v in startup_profile.items() if v
            )
        system_content = base_system + profile_ctx

    agent_llm = build_llm_from_state(state_stub, max_tokens=2048, temperature=temperature)
    response = await agent_llm.ainvoke([SystemMessage(content=system_content)] + history)
    response_text = response.content if isinstance(response.content, str) else str(response.content)

    history.append(AIMessage(content=response_text))
    _sessions[session_id] = history[-20:]

    return {"session_id": session_id, "agent": agent, "response": response_text}


@router.delete("/history")
async def clear_history(session_id: str):
    _sessions.pop(session_id, None)
    return {"status": "cleared", "session_id": session_id}
