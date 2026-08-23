import os
import threading
from app.infrastructure.email import send_email
from app.database.session import SessionLocal
from app.database.models.notification import Notification

def run_email_sending_thread(notification_id: str, recipient_email: str, subject: str, html_body: str):
    db = SessionLocal()
    try:
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification or notification.status == "SENT":
            return
        notification.attempts += 1
        db.commit()

        # Send email via Resend
        send_email(recipient_email, subject, html_body)

        notification.status = "SENT"
        db.commit()
    except Exception as exc:
        db.rollback()
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.status = "FAILED"
            notification.last_error = str(exc)
            db.commit()
    finally:
        db.close()

def send_notification_email_async(notification_id: str, recipient_email: str, subject: str, html_body: str):
    # Check if we should use Celery (default is true if REDIS_URL is present)
    has_redis = bool(os.getenv("REDIS_URL"))
    use_celery = os.getenv("USE_CELERY", "true").lower() == "true" and has_redis
    
    if use_celery:
        try:
            from app.modules.notifications.tasks import dispatch_email_notification
            dispatch_email_notification.delay(notification_id, recipient_email, subject, html_body)
            return
        except Exception as e:
            print(f"Failed to queue via Celery, falling back to background thread: {e}")
            
    # Fallback to local background thread (for Render Free Tier where Celery/Redis are unavailable)
    thread = threading.Thread(
        target=run_email_sending_thread,
        args=(notification_id, recipient_email, subject, html_body),
        daemon=True
    )
    thread.start()
