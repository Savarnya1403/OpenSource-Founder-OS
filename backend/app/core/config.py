from __future__ import annotations
import warnings
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import List

_INSECURE_DEFAULTS = {
    "dev-secret-change-in-production",
    "admin123",
}


class Settings(BaseSettings):
    # App
    APP_NAME: str = "OpenFounder OS"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "*"

    # LLM
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-sonnet-4-6"

    # Auth
    SECRET_KEY: str = "dev-secret-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ALGORITHM: str = "HS256"

    # Admin Auth
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "admin123"

    # GitHub-as-database (user storage)
    GITHUB_TOKEN: str = ""
    GITHUB_OWNER: str = "Savarnya1403"
    GITHUB_REPO: str = "OpenSource-Founder-OS"
    GITHUB_DB_BRANCH: str = "db"

    # SQLite for forum/traction (ephemeral /tmp on Vercel — fine for MVP)
    DATABASE_URL: str = "sqlite+aiosqlite:////tmp/openfounder.db"

    # RAG (optional)
    USE_MOCK_RAG: bool = True
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION: str = "openfounder"

    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "openfounder"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    def warn_insecure(self) -> None:
        if self.ENVIRONMENT == "production":
            if self.SECRET_KEY in _INSECURE_DEFAULTS:
                raise RuntimeError("SECRET_KEY must be changed in production")
            if self.ADMIN_PASSWORD in _INSECURE_DEFAULTS:
                raise RuntimeError("ADMIN_PASSWORD must be changed in production")
            if not self.GITHUB_TOKEN:
                raise RuntimeError("GITHUB_TOKEN must be set in production")

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    s.warn_insecure()
    return s
