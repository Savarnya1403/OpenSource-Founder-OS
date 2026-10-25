from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import init_db
from app.api.routes import auth, chat, schemes, health, vcs, knowledge, wizards, tools, traction, forum, events, incubators, mentors, accelerators, funded_startups, individual_angels, term_sheet, intel, login_activity, admin, pipeline, analyzer

# Import models so SQLAlchemy registers them before init_db()
import app.models.traction  # noqa: F401
import app.models.forum     # noqa: F401
import app.models.login_activity  # noqa: F401
import app.models.pipeline  # noqa: F401

settings = get_settings()

_is_prod = settings.ENVIRONMENT == "production"

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="OpenFounder OS API",
    description="AI Cofounder & Startup Ecosystem Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
    # Disable interactive docs in production — they expose the full API surface
    docs_url=None if _is_prod else "/docs",
    redoc_url=None if _is_prod else "/redoc",
    openapi_url=None if _is_prod else "/openapi.json",
)

cors_origins = settings.cors_origins_list
_wildcard = "*" in cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if not _wildcard else [],
    allow_origin_regex=r".*" if _wildcard else None,
    allow_credentials=not _wildcard,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(schemes.router, prefix="/api")
app.include_router(vcs.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")
app.include_router(wizards.router, prefix="/api")
app.include_router(tools.router, prefix="/api")
app.include_router(traction.router, prefix="/api")
app.include_router(forum.router, prefix="/api")
app.include_router(events.router, prefix="/api")
app.include_router(incubators.router, prefix="/api")
app.include_router(mentors.router, prefix="/api")
app.include_router(accelerators.router, prefix="/api")
app.include_router(funded_startups.router, prefix="/api")
app.include_router(individual_angels.router, prefix="/api")
app.include_router(term_sheet.router, prefix="/api")
app.include_router(intel.router, prefix="/api")
app.include_router(login_activity.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(pipeline.router, prefix="/api")
app.include_router(analyzer.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "OpenFounder OS API", "docs": "/docs"}
