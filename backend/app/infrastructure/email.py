import os
# pyrefly: ignore [missing-import]
import resend
from app.core.config import settings

def get_resend_api_key():
    return os.getenv("RESEND_API_KEY") or settings.RESEND_API_KEY

def send_email(to_email: str, subject: str, html_content: str):
    api_key = get_resend_api_key()
    if not api_key:
        raise RuntimeError("RESEND_API_KEY is not configured")
    resend.api_key = api_key
    try:
        from_email = os.getenv("EMAIL_FROM") or settings.EMAIL_FROM or "onboarding@resend.dev"
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        response = resend.Emails.send(params)
        return response
    except Exception as e:
        raise RuntimeError(f"Failed to send email via Resend: {str(e)}")