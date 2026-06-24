from fastapi import APIRouter
from app.core.config import get_settings

router = APIRouter(tags=["health"])
settings = get_settings()


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "ai_configured": bool(settings.ANTHROPIC_API_KEY),
        "mock_rag": settings.USE_MOCK_RAG,
        "model": settings.CLAUDE_MODEL,
    }
