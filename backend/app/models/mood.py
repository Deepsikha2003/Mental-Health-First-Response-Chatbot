# ─────────────────────────────────────────────────────────────
#  models/mood.py  — Mood log entries
# ─────────────────────────────────────────────────────────────
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    mood       = Column(String, nullable=False)      # happy | sad | anxious | depressed | neutral | angry
    score      = Column(Float, nullable=False)       # 1–10 numeric score
    note       = Column(Text, nullable=True)         # optional free-text note
    source     = Column(String, default="manual")   # "manual" | "chat"
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
