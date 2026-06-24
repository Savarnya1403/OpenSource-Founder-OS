from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.database import init_db
from app.api.routes import auth, chat, schemes, health, vcs, knowledge, wizards, tools, traction, forum, events, incubators

# Import models so SQLAlchemy registers them before init_db()
import app.models.traction  # noqa: F401
import app.models.forum     # noqa: F401

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
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


@app.get("/")
async def root():
    return {"message": "OpenFounder OS API", "docs": "/docs"}
