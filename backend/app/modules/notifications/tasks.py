from app.infrastructure.celery import celery_app
from app.infrastructure.email import send_email
from app.database.session import SessionLocal
from app.database.models.notification import Notification
from app.database.models.user import User

@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def dispatch_email_notification(self, notification_id: str, recipient_email: str, subject: str, html_body: str):
    db = SessionLocal()
    try:
        # Check idempotency / tracking state in DB
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if not notification:
            return
        
        if notification.status == "SENT":
            return # Already processed! Idempotency guard.

        notification.attempts += 1
        db.commit()

        # Send via Resend
        send_email(recipient_email, subject, html_body)

        # Mark success
        notification.status = "SENT"
        db.commit()
    except Exception as exc:
        db.rollback()
        notification = db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            notification.status = "FAILED"
            notification.last_error = str(exc)
            db.commit()
        # Retry with exponential backoff
        raise self.retry(exc=exc)
    finally:
        db.close()