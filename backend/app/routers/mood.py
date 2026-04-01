# ─────────────────────────────────────────────────────────────
#  routers/mood.py  — /mood  (log + history + stats)
# ─────────────────────────────────────────────────────────────
from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.mood import MoodLog
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/mood", tags=["mood"])


# ── Schemas ───────────────────────────────────────────────────

class MoodIn(BaseModel):
    mood: str           # happy | sad | anxious | depressed | neutral | angry
    score: float        # 1–10
    note: str | None = None


class MoodOut(BaseModel):
    id: int
    mood: str
    score: float
    note: str | None
    source: str
    created_at: datetime

    class Config:
        from_attributes = True


class MoodStats(BaseModel):
    average_score: float
    dominant_mood: str
    total_entries: int
    streak_days: int


# ── Routes ────────────────────────────────────────────────────

@router.post("/log", response_model=MoodOut, status_code=201)
def log_mood(
    body: MoodIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Manually log a mood entry."""
    entry = MoodLog(
        user_id=current_user.id,
        mood=body.mood,
        score=body.score,
        note=body.note,
        source="manual",
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/history", response_model=List[MoodOut])
def mood_history(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return mood logs for the past N days (default 30)."""
    since = datetime.utcnow() - timedelta(days=days)
    return (
        db.query(MoodLog)
        .filter(MoodLog.user_id == current_user.id, MoodLog.created_at >= since)
        .order_by(MoodLog.created_at.asc())
        .all()
    )


@router.get("/stats", response_model=MoodStats)
def mood_stats(
    days: int = Query(default=30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return aggregated mood statistics for the past N days."""
    since = datetime.utcnow() - timedelta(days=days)
    logs = (
        db.query(MoodLog)
        .filter(MoodLog.user_id == current_user.id, MoodLog.created_at >= since)
        .all()
    )

    if not logs:
        return MoodStats(average_score=5.0, dominant_mood="neutral", total_entries=0, streak_days=0)

    avg = sum(l.score for l in logs) / len(logs)

    # Dominant mood by frequency
    counts: dict[str, int] = {}
    for l in logs:
        counts[l.mood] = counts.get(l.mood, 0) + 1
    dominant = max(counts, key=lambda k: counts[k])

    # Streak: consecutive days with at least one entry
    unique_days = sorted({l.created_at.date() for l in logs}, reverse=True)
    streak = 0
    today = datetime.utcnow().date()
    for i, day in enumerate(unique_days):
        if (today - day).days == i:
            streak += 1
        else:
            break

    return MoodStats(
        average_score=round(avg, 2),
        dominant_mood=dominant,
        total_entries=len(logs),
        streak_days=streak,
    )
