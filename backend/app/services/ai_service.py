# ─────────────────────────────────────────────────────────────
#  services/ai_service.py  — Google Gemini chat wrapper
#  Falls back to rule-based responses when no API key is set.
# ─────────────────────────────────────────────────────────────
from __future__ import annotations

import random
from typing import List, Dict

from app.core.config import get_settings
from app.services.sentiment import AnalysisResult

settings = get_settings()

# ── System prompt ─────────────────────────────────────────────
SYSTEM_PROMPT = """You are MediCare Assistant, a compassionate AI mental health first-response chatbot.

YOUR ROLE:
- Provide empathetic, non-judgmental emotional support
- Use active listening: reflect emotions, validate experiences
- Suggest evidence-based CBT coping strategies when appropriate
- Keep responses warm, concise (2-4 paragraphs), and human

SAFETY RULES (HIGHEST PRIORITY):
- If user expresses suicidal ideation or self-harm → immediately provide crisis resources:
  988 Suicide & Crisis Lifeline (call/text 988), Crisis Text Line (text HOME to 741741)
- Never diagnose or prescribe medication
- Always recommend professional help for serious concerns

TONE: Warm, calm, gentle — like a trusted friend with psychology training.
End each response with one open-ended question to continue the conversation."""

# ── Fallback responses (used when OpenAI key is absent) ──────

FALLBACK = {
    "happy": [
        "That's wonderful to hear! 😊 It sounds like things are going well for you right now. "
        "Positive emotions are so valuable — what's been contributing most to your good mood lately?",
        "I'm really glad you're feeling happy! Savoring these moments can actually strengthen your "
        "emotional resilience. What's been the highlight of your day?",
    ],
    "sad": [
        "I'm really sorry you're feeling this way. Sadness can feel so heavy, and it's completely "
        "valid to feel what you're feeling. You don't have to carry this alone. "
        "Would you like to share more about what's been going on?",
        "It takes courage to acknowledge when we're hurting. I'm here with you. "
        "Sometimes just putting feelings into words can help — what's been weighing on your heart?",
    ],
    "anxious": [
        "Anxiety can feel really overwhelming, and I hear you. Let's try a quick grounding exercise: "
        "name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste. "
        "This 5-4-3-2-1 technique can help anchor you in the present. How are you feeling right now?",
        "I understand — anxiety has a way of making everything feel urgent and scary. "
        "Try taking a slow deep breath with me: inhale for 4 counts, hold for 4, exhale for 6. "
        "What's been triggering these anxious feelings?",
    ],
    "depressed": [
        "I'm really glad you reached out. Depression can make everything feel impossibly heavy, "
        "and it's important you know that what you're experiencing is real and valid. "
        "You deserve support. Can you tell me a little more about how long you've been feeling this way?",
        "Thank you for trusting me with this. When depression hits, even small tasks can feel "
        "monumental — and that's okay. One tiny step at a time is enough. "
        "Is there one small thing that brought you even a moment of comfort recently?",
    ],
    "angry": [
        "It sounds like you're dealing with a lot of frustration right now, and that's completely "
        "understandable. Anger often signals that something important to us has been threatened. "
        "Would you like to talk about what's been making you feel this way?",
        "I hear the frustration in your words. Anger is a valid emotion — it's what we do with it "
        "that matters. Sometimes writing down what's bothering us can help release some of that tension. "
        "What's been going on?",
    ],
    "neutral": [
        "Thank you for sharing that with me. I'm here to listen and support you however I can. "
        "How are you feeling emotionally today — is there something specific on your mind?",
        "I appreciate you reaching out. Sometimes it helps just to have a space to talk. "
        "What's been on your mind lately?",
    ],
}

CRISIS_TIER2_RESPONSE = """I can hear that you're going through something really difficult right now, and I want you to know that your feelings are valid and you are not alone. 💙

When things feel this overwhelming, it's important to reach out for extra support:

**Immediate Resources:**
- 📞 **988 Suicide & Crisis Lifeline** — Call or text **988** (free, 24/7)
- 💬 **Crisis Text Line** — Text **HOME** to **741741**
- 🌐 **NAMI Helpline** — 1-800-950-6264

You deserve care and support. Would you be willing to tell me more about what's been happening?"""

CRISIS_TIER3_RESPONSE = """I'm very concerned about your safety right now, and I want you to know that your life has value. Please reach out for immediate help:

🚨 **EMERGENCY RESOURCES — Please contact one now:**
- 📞 **988 Suicide & Crisis Lifeline** — Call or text **988** (free, 24/7, confidential)
- 💬 **Crisis Text Line** — Text **HOME** to **741741**
- 🚑 **Emergency Services** — Call **911** if you are in immediate danger

You are not alone. A trained crisis counselor can help you through this moment. Will you reach out to one of these resources right now?"""


async def get_ai_response(
    user_message: str,
    history: List[Dict[str, str]],
    analysis: AnalysisResult,
) -> str:
    """
    Generate a response using OpenAI if key is available,
    otherwise fall back to curated rule-based responses.
    """
    # Always use crisis responses for tier 2/3 regardless of AI
    if analysis.crisis_tier == 3:
        return CRISIS_TIER3_RESPONSE
    if analysis.crisis_tier == 2:
        return CRISIS_TIER2_RESPONSE

    # Try Gemini
    if settings.GEMINI_API_KEY:
        try:
            return await _gemini_response(user_message, history, analysis)
        except Exception as exc:
            print(f"[AI] Gemini error, falling back: {exc}")

    # Fallback
    options = FALLBACK.get(analysis.sentiment, FALLBACK["neutral"])
    return random.choice(options)


async def _gemini_response(
    user_message: str,
    history: List[Dict[str, str]],
    analysis: AnalysisResult,
) -> str:
    """Call Google Gemini API (gemini-1.5-flash)."""
    import google.generativeai as genai

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_PROMPT,
    )

    # Build Gemini chat history (alternating user/model roles)
    gemini_history = []
    for msg in history[-10:]:
        role = "model" if msg["role"] == "assistant" else "user"
        gemini_history.append({"role": role, "parts": [msg["content"]]})

    chat = model.start_chat(history=gemini_history)

    # Append sentiment context to the message
    sentiment_note = (
        f"\n\n[Context: Detected sentiment={analysis.sentiment}, "
        f"crisis_tier={analysis.crisis_tier}]"
    )
    response = await chat.send_message_async(
        user_message + sentiment_note,
        generation_config=genai.GenerationConfig(max_output_tokens=500, temperature=0.7),
    )
    return response.text.strip()
