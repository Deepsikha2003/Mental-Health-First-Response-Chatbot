# ─────────────────────────────────────────────────────────────
#  models/session.py  — Chat session + individual messages
# ─────────────────────────────────────────────────────────────
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    title      = Column(String, default="New Session")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")
    user     = relationship("User")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id           = Column(Integer, primary_key=True, index=True)
    session_id   = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role         = Column(String, nullable=False)          # "user" | "assistant"
    content      = Column(Text, nullable=False)
    sentiment    = Column(String, nullable=True)           # happy | sad | anxious | depressed | neutral
    crisis_tier  = Column(Integer, default=0)              # 0=none 1=mild 2=high 3=critical
    created_at   = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")
