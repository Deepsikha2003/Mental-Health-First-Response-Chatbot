# ─────────────────────────────────────────────────────────────
#  main.py  — FastAPI application entry point
# ─────────────────────────────────────────────────────────────
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import engine, Base

# Import all models so SQLAlchemy creates their tables
from app.models import user, session, mood  # noqa: F401

from app.routers import auth, chat, mood as mood_router

settings = get_settings()

# ── Create all tables on startup ──────────────────────────────
Base.metadata.create_all(bind=engine)

# ── FastAPI app ───────────────────────────────────────────────
app = FastAPI(
    title="Naga AI — Mental Health First Response",
    description="AI-powered chatbot providing emotional support, crisis detection, and coping strategies.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(mood_router.router)


@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "app": "Naga AI Backend", "version": "1.0.0"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "healthy"}
