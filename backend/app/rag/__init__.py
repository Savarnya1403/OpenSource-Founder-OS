from __future__ import annotations
from app.rag.omnirag import OmniRAG

_instance: OmniRAG | None = None


def get_rag() -> OmniRAG:
    global _instance
    if _instance is None:
        _instance = OmniRAG()
    return _instance
