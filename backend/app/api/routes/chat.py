from __future__ import annotations
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage
from app.agents.graph import get_graph
from app.agents.state import OpenFounderState
from app.models.chat import ChatRequest
from app.models.user import UserDB
from app.api.deps import get_optional_user
from app.core.config import get_settings

router = APIRouter(prefix="/chat", tags=["chat"])
settings = get_settings()

# In-memory session store (use Redis in production)
_sessions: dict[str, list] = {}


@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    user: UserDB | None = Depends(get_optional_user),
):
    """Stream chat response via Server-Sent Events."""
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY not configured. Add it to backend/.env to enable AI features.",
        )

    session_id = payload.session_id or str(uuid.uuid4())
    history = _sessions.get(session_id, [])

    # Build startup profile from user + request context
    startup_profile = {}
    if user:
        startup_profile = {
            "startup_name": user.startup_name,
            "startup_stage": user.startup_stage,
            "sector": user.sector,
            "city": user.city,
        }
    if payload.startup_context:
        startup_profile.update(payload.startup_context)

    # Append user message to history
    history.append(HumanMessage(content=payload.message))

    initial_state: OpenFounderState = {
        "messages": history,
        "active_agent": "",
        "startup_profile": startup_profile,
        "retrieved_context": "",
        "next_agent": "",
    }

    async def event_generator():
        graph = get_graph()
        agent_announced = False
        full_response = ""

        try:
            async for event in graph.astream_events(initial_state, version="v2"):
                kind = event.get("event")

                # Announce which agent is responding
                if kind == "on_chain_end" and event.get("name") == "supervisor":
                    output = event.get("data", {}).get("output", {})
                    active = output.get("active_agent", "")
                    if active and not agent_announced:
                        agent_announced = True
                        chunk = json.dumps({"type": "agent_switch", "agent": active, "session_id": session_id})
                        yield f"data: {chunk}\n\n"

                # Stream LLM tokens
                elif kind == "on_chat_model_stream":
                    content = event.get("data", {}).get("chunk", {})
                    if hasattr(content, "content") and content.content:
                        token = content.content
                        full_response += token
                        chunk = json.dumps({"type": "token", "content": token})
                        yield f"data: {chunk}\n\n"

            # Save to session history
            history.append(AIMessage(content=full_response))
            _sessions[session_id] = history[-20:]  # keep last 20 messages

            done = json.dumps({"type": "done", "session_id": session_id})
            yield f"data: {done}\n\n"

        except Exception as e:
            error = json.dumps({"type": "error", "content": str(e)})
            yield f"data: {error}\n\n"

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
    user: UserDB | None = Depends(get_optional_user),
):
    """Non-streaming chat — returns full response at once."""
    if not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="ANTHROPIC_API_KEY not configured.",
        )

    session_id = payload.session_id or str(uuid.uuid4())
    history = _sessions.get(session_id, [])

    startup_profile = {}
    if user:
        startup_profile = {
            "startup_name": user.startup_name,
            "startup_stage": user.startup_stage,
            "sector": user.sector,
            "city": user.city,
        }
    if payload.startup_context:
        startup_profile.update(payload.startup_context)

    history.append(HumanMessage(content=payload.message))

    initial_state: OpenFounderState = {
        "messages": history,
        "active_agent": "",
        "startup_profile": startup_profile,
        "retrieved_context": "",
        "next_agent": "",
    }

    graph = get_graph()
    result = await graph.ainvoke(initial_state)

    ai_messages = [m for m in result["messages"] if isinstance(m, AIMessage)]
    response_text = ai_messages[-1].content if ai_messages else "No response generated."
    active_agent = result.get("active_agent", "mentor")

    history.append(AIMessage(content=response_text))
    _sessions[session_id] = history[-20:]

    return {
        "session_id": session_id,
        "agent": active_agent,
        "response": response_text,
    }


@router.delete("/history")
async def clear_history(session_id: str):
    _sessions.pop(session_id, None)
    return {"status": "cleared", "session_id": session_id}
