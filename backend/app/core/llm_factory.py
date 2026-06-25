from __future__ import annotations
"""LLM factory — builds a LangChain chat model from provider + api_key config."""
from typing import Any


PROVIDERS = {
    "anthropic": {
        "label": "Anthropic (Claude)",
        "models": [
            "claude-sonnet-4-6",
            "claude-haiku-4-5-20251001",
            "claude-opus-4-8",
        ],
        "default_model": "claude-sonnet-4-6",
    },
    "openai": {
        "label": "OpenAI (ChatGPT)",
        "models": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
        "default_model": "gpt-4o",
    },
    "gemini": {
        "label": "Google (Gemini)",
        "models": ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
        "default_model": "gemini-2.0-flash",
    },
    "deepseek": {
        "label": "DeepSeek",
        "models": ["deepseek-chat", "deepseek-reasoner"],
        "default_model": "deepseek-chat",
    },
}


def build_llm(
    provider: str,
    api_key: str,
    model: str | None = None,
    *,
    max_tokens: int = 2048,
    temperature: float = 0.7,
) -> Any:
    """Return a LangChain chat model for the given provider and key."""
    provider = provider.lower()
    if provider not in PROVIDERS:
        raise ValueError(f"Unknown provider: {provider}. Choose from {list(PROVIDERS)}")

    chosen_model = model or PROVIDERS[provider]["default_model"]

    if provider == "anthropic":
        from langchain_anthropic import ChatAnthropic
        return ChatAnthropic(
            model=chosen_model,
            anthropic_api_key=api_key,
            max_tokens=max_tokens,
            temperature=temperature,
        )

    if provider == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=chosen_model,
            api_key=api_key,
            max_tokens=max_tokens,
            temperature=temperature,
        )

    if provider == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        return ChatGoogleGenerativeAI(
            model=chosen_model,
            google_api_key=api_key,
            max_output_tokens=max_tokens,
            temperature=temperature,
        )

    if provider == "deepseek":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=chosen_model,
            api_key=api_key,
            base_url="https://api.deepseek.com",
            max_tokens=max_tokens,
            temperature=temperature,
        )

    raise ValueError(f"Unhandled provider: {provider}")


def build_llm_from_state(state: dict, *, max_tokens: int = 2048, temperature: float = 0.7) -> Any:
    """Build LLM from state's llm_config, falling back to settings ANTHROPIC_API_KEY."""
    llm_config = state.get("llm_config") or {}
    provider = llm_config.get("provider", "")
    api_key = llm_config.get("api_key", "")
    model = llm_config.get("model") or None

    if provider and api_key:
        return build_llm(provider, api_key, model, max_tokens=max_tokens, temperature=temperature)

    # Fall back to server-side Anthropic key
    from app.core.config import get_settings
    settings = get_settings()
    if not settings.ANTHROPIC_API_KEY:
        raise RuntimeError(
            "No API key available. Either configure ANTHROPIC_API_KEY on the server "
            "or add your own key in AI Settings."
        )
    from langchain_anthropic import ChatAnthropic
    return ChatAnthropic(
        model=settings.CLAUDE_MODEL,
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        max_tokens=max_tokens,
        temperature=temperature,
    )
