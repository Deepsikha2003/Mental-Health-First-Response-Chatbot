# ─────────────────────────────────────────────────────────────
#  services/emergency.py  — Twilio SMS emergency alert
# ─────────────────────────────────────────────────────────────
from app.core.config import get_settings

settings = get_settings()


def send_emergency_sms(user_email: str, message_snippet: str) -> bool:
    """
    Send an SMS alert via Twilio when a Tier-3 crisis is detected.
    Returns True on success, False if Twilio is not configured or fails.
    """
    if not all([
        settings.TWILIO_ACCOUNT_SID,
        settings.TWILIO_AUTH_TOKEN,
        settings.TWILIO_FROM_NUMBER,
        settings.EMERGENCY_CONTACT_NUMBER,
    ]):
        # Twilio not configured — log and skip
        print(
            f"[EMERGENCY] Tier-3 crisis detected for {user_email}. "
            "Twilio not configured — skipping SMS."
        )
        return False

    try:
        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        body = (
            f"🚨 NAGA AI CRISIS ALERT\n"
            f"User: {user_email}\n"
            f"Message: \"{message_snippet[:100]}...\"\n"
            f"Please check on this person immediately."
        )
        client.messages.create(
            body=body,
            from_=settings.TWILIO_FROM_NUMBER,
            to=settings.EMERGENCY_CONTACT_NUMBER,
        )
        print(f"[EMERGENCY] SMS sent for user {user_email}")
        return True
    except Exception as exc:
        print(f"[EMERGENCY] SMS failed: {exc}")
        return False
