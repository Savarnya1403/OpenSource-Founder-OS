from __future__ import annotations
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.messages import HumanMessage, AIMessage
from app.agents.graph import get_graph
from app.agents.state import OpenFounderState
from app.models.chat import ChatRequest
from app.api.deps import get_optional_user
from app.core.config import get_settings
from app.core.llm_factory import PROVIDERS

router = APIRouter(prefix="/chat", tags=["chat"])
settings = get_settings()


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

# In-memory session store (use Redis in production)
_sessions: dict[str, list] = {}


@router.post("/stream")
async def chat_stream(
    payload: ChatRequest,
    user: dict | None = Depends(get_optional_user),
):
    """Stream chat response via Server-Sent Events."""
    has_user_key = bool(payload.llm_provider and payload.llm_api_key)
    if not has_user_key and not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="No AI provider configured. Add your API key in AI Settings (⚙ icon in sidebar).",
        )

    session_id = payload.session_id or str(uuid.uuid4())
    history = _sessions.get(session_id, [])

    startup_profile = {}
    if user:
        startup_profile = {
            "startup_name": user.get("startup_name"),
            "startup_stage": user.get("startup_stage"),
            "sector": user.get("sector"),
            "city": user.get("city"),
        }
    if payload.startup_context:
        startup_profile.update(payload.startup_context)

    llm_config: dict = {}
    if has_user_key:
        llm_config = {
            "provider": payload.llm_provider,
            "api_key": payload.llm_api_key,
            "model": payload.llm_model,
        }

    history.append(HumanMessage(content=payload.message))

    initial_state: OpenFounderState = {
        "messages": history,
        "active_agent": "",
        "startup_profile": startup_profile,
        "retrieved_context": "",
        "next_agent": "",
        "llm_config": llm_config,
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
                    msg_chunk = event.get("data", {}).get("chunk", {})
                    if not hasattr(msg_chunk, "content"):
                        continue
                    raw = msg_chunk.content
                    # Anthropic/Gemini return str; OpenAI/DeepSeek return list of dicts
                    if isinstance(raw, str):
                        token = raw
                    elif isinstance(raw, list):
                        token = "".join(
                            item.get("text", "") if isinstance(item, dict) else str(item)
                            for item in raw
                        )
                    else:
                        token = ""
                    if token:
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
    user: dict | None = Depends(get_optional_user),
):
    """Non-streaming chat — returns full response at once."""
    has_user_key = bool(payload.llm_provider and payload.llm_api_key)
    if not has_user_key and not settings.ANTHROPIC_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="No AI provider configured. Add your API key in AI Settings.",
        )

    session_id = payload.session_id or str(uuid.uuid4())
    history = _sessions.get(session_id, [])

    startup_profile = {}
    if user:
        startup_profile = {
            "startup_name": user.get("startup_name"),
            "startup_stage": user.get("startup_stage"),
            "sector": user.get("sector"),
            "city": user.get("city"),
        }
    if payload.startup_context:
        startup_profile.update(payload.startup_context)

    llm_config: dict = {}
    if has_user_key:
        llm_config = {
            "provider": payload.llm_provider,
            "api_key": payload.llm_api_key,
            "model": payload.llm_model,
        }

    history.append(HumanMessage(content=payload.message))

    initial_state: OpenFounderState = {
        "messages": history,
        "active_agent": "",
        "startup_profile": startup_profile,
        "retrieved_context": "",
        "next_agent": "",
        "llm_config": llm_config,
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
