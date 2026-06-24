from __future__ import annotations
from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache
from typing import List


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

    # GitHub-as-database (user storage)
    GITHUB_TOKEN: str = ""       # set in Vercel env vars
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

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
