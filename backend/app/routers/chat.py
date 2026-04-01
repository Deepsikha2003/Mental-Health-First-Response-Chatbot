# ─────────────────────────────────────────────────────────────
#  routers/chat.py  — /chat  (sessions + messages)
# ─────────────────────────────────────────────────────────────
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.session import ChatSession, ChatMessage
from app.models.mood import MoodLog
from app.models.user import User
from app.routers.auth import get_current_user
from app.services.sentiment import analyse
from app.services.ai_service import get_ai_response
from app.services.emergency import send_emergency_sms

router = APIRouter(prefix="/chat", tags=["chat"])


# ── Schemas ───────────────────────────────────────────────────

class MessageIn(BaseModel):
    content: str
    session_id: int | None = None   # omit to start a new session


class MessageOut(BaseModel):
    id: int
    role: str
    content: str
    sentiment: str | None
    crisis_tier: int
    created_at: datetime

    class Config:
        from_attributes = True


class SessionOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    session_id: int
    user_message: MessageOut
    bot_message: MessageOut
    crisis_tier: int
    sentiment: str
    emergency_triggered: bool = False


# ── Routes ────────────────────────────────────────────────────

@router.post("/message", response_model=ChatResponse)
async def send_message(
    body: MessageIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Process a user message:
    1. Analyse sentiment + crisis tier
    2. Generate AI response
    3. Persist both messages
    4. Auto-log mood
    5. Trigger emergency alert if tier 3
    """
    # ── Get or create session ─────────────────────────────────
    if body.session_id:
        session = db.query(ChatSession).filter(
            ChatSession.id == body.session_id,
            ChatSession.user_id == current_user.id,
        ).first()
        if not session:
            raise HTTPException(404, "Session not found")
    else:
        session = ChatSession(user_id=current_user.id, title=body.content[:40])
        db.add(session)
        db.flush()

    # ── Analyse ───────────────────────────────────────────────
    analysis = analyse(body.content)

    # ── Build history for AI context ──────────────────────────
    recent = (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session.id)
        .order_by(ChatMessage.created_at.desc())
        .limit(20)
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in reversed(recent)]

    # ── Generate AI response ──────────────────────────────────
    bot_text = await get_ai_response(body.content, history, analysis)

    # ── Persist user message ──────────────────────────────────
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=body.content,
        sentiment=analysis.sentiment,
        crisis_tier=analysis.crisis_tier,
    )
    db.add(user_msg)

    # ── Persist bot message ───────────────────────────────────
    bot_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=bot_text,
        sentiment=None,
        crisis_tier=0,
    )
    db.add(bot_msg)

    # ── Auto-log mood from chat ───────────────────────────────
    mood_entry = MoodLog(
        user_id=current_user.id,
        mood=analysis.sentiment,
        score=analysis.mood_score,
        source="chat",
    )
    db.add(mood_entry)

    # ── Update session timestamp ──────────────────────────────
    session.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user_msg)
    db.refresh(bot_msg)

    # ── Emergency escalation ──────────────────────────────────
    emergency = False
    if analysis.crisis_tier == 3:
        emergency = send_emergency_sms(current_user.email, body.content)

    return ChatResponse(
        session_id=session.id,
        user_message=user_msg,
        bot_message=bot_msg,
        crisis_tier=analysis.crisis_tier,
        sentiment=analysis.sentiment,
        emergency_triggered=emergency,
    )


@router.get("/sessions", response_model=List[SessionOut])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all chat sessions for the current user (newest first)."""
    return (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
        .all()
    )


@router.get("/sessions/{session_id}/messages", response_model=List[MessageOut])
def get_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all messages in a session."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(404, "Session not found")

    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


@router.delete("/sessions/{session_id}", status_code=204)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a chat session and all its messages."""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id,
    ).first()
    if not session:
        raise HTTPException(404, "Session not found")
    db.delete(session)
    db.commit()
