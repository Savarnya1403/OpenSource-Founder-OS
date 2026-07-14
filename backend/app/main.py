from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import init_db
from app.api.routes import auth, chat, schemes, health, vcs, knowledge, wizards, tools, traction, forum, events, incubators, mentors, accelerators, funded_startups, individual_angels, term_sheet, intel, login_activity, admin

# Import models so SQLAlchemy registers them before init_db()
import app.models.traction  # noqa: F401
import app.models.forum     # noqa: F401
import app.models.login_activity  # noqa: F401

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="OpenFounder OS API",
    description="AI Cofounder & Startup Ecosystem Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

cors_origins = settings.cors_origins_list
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials="*" not in cors_origins,
    allow_origin_regex=r".*" if "*" in cors_origins else None,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.get("/")
async def root():
    return {"message": "OpenFounder OS API", "docs": "/docs"}
