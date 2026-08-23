import uuid
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.database.models.user import User
from app.database.models.complaint import Complaint, ComplaintStatus
from app.database.models.history import ComplaintHistory
from app.database.models.notification import Notification
from app.modules.complaints.schemas import ComplaintCreate, StatusUpdate, PriorityUpdate
from app.modules.complaints.state_machine import validate_status_transition

def create_complaint(db: Session, payload: ComplaintCreate, resident_id: str) -> Complaint:
    count = db.query(Complaint).count() + 1
    complaint_number = f"CMP-{1000 + count}"

    complaint = Complaint(
        id=str(uuid.uuid4()),
        complaint_number=complaint_number,
        resident_id=resident_id,
        category=payload.category,
        description=payload.description,
        priority=payload.priority,
        photo_url=payload.photo_url,
        status=ComplaintStatus.OPEN
    )
    db.add(complaint)

    history = ComplaintHistory(
        id=str(uuid.uuid4()),
        complaint_id=complaint.id,
        actor_id=resident_id,
        old_status=None,
        new_status=ComplaintStatus.OPEN,
        note="Complaint submitted"
    )
    db.add(history)
    db.commit()
    db.refresh(complaint)

    # Queue async email notification on new complaint
    try:
        resident = db.query(User).filter(User.id == resident_id).first()
        if resident and resident.email:
            cat_val = complaint.category.value if hasattr(complaint.category, 'value') else str(complaint.category)
            pri_val = complaint.priority.value if hasattr(complaint.priority, 'value') else str(complaint.priority)
            
            # Email to Resident
            notif_res_id = str(uuid.uuid4())
            db.add(Notification(
                id=notif_res_id,
                type="NEW_COMPLAINT",
                recipient_id=resident.id,
                status="PENDING",
                idempotency_key=f"NEW_COMPLAINT:{complaint.id}:{resident.id}"
            ))
            db.commit()

            subject_res = f"Complaint Received: {complaint.complaint_number}"
            body_res = f"""
            <h2>Complaint Received</h2>
            <p>Hello {resident.name},</p>
            <p>Your maintenance request <strong>{complaint.complaint_number}</strong> has been logged successfully.</p>
            <p><strong>Category:</strong> {cat_val}</p>
            <p><strong>Priority:</strong> {pri_val}</p>
            <p><strong>Description:</strong> {complaint.description}</p>
            """
            from app.modules.notifications.service import send_notification_email_async
            send_notification_email_async(notif_res_id, resident.email, subject_res, body_res)

            # Email to Admin
            admin = db.query(User).filter(User.role == 'ADMIN').first()
            if admin and admin.email:
                notif_admin_id = str(uuid.uuid4())
                db.add(Notification(
                    id=notif_admin_id,
                    type="ADMIN_ALERT",
                    recipient_id=admin.id,
                    status="PENDING",
                    idempotency_key=f"ADMIN_ALERT:{complaint.id}:{admin.id}"
                ))
                db.commit()

                photo_html = f'<p><strong>Attached Photo:</strong><br/><img src="{complaint.photo_url}" style="max-width:400px; border-radius:8px;" /></p>' if complaint.photo_url else ''
                subject_admin = f"New Ticket Raised: {complaint.complaint_number} by {resident.name}"
                body_admin = f"""
                <h2>New Complaint Alert</h2>
                <p>A new complaint has been submitted by resident <strong>{resident.name}</strong> ({resident.email}).</p>
                <p><strong>Ticket ID:</strong> {complaint.complaint_number}</p>
                <p><strong>Category:</strong> {cat_val}</p>
                <p><strong>Priority:</strong> {pri_val}</p>
                <p><strong>Description:</strong> {complaint.description}</p>
                {photo_html}
                <hr/>
                <p>Please log in to the admin portal to manage this ticket.</p>
                """
                send_notification_email_async(notif_admin_id, admin.email, subject_admin, body_admin)
    except Exception as exc:
        print(f"Error sending complaint creation emails: {exc}")

    return complaint

def update_complaint_status(db: Session, complaint_id: str, payload: StatusUpdate, admin_id: str) -> Complaint:
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    old_status = complaint.status
    new_status = payload.status

    if old_status != new_status:
        validate_status_transition(old_status, new_status)

    complaint.status = new_status
    complaint.updated_at = datetime.now(timezone.utc)
    if new_status == ComplaintStatus.RESOLVED and not complaint.resolved_at:
        complaint.resolved_at = datetime.now(timezone.utc)

    history = ComplaintHistory(
        id=str(uuid.uuid4()),
        complaint_id=complaint.id,
        actor_id=admin_id,
        old_status=old_status,
        new_status=new_status,
        note=payload.note
    )
    db.add(history)

    notif_id = str(uuid.uuid4())
    notification = Notification(
        id=notif_id,
        type="STATUS_CHANGE",
        recipient_id=complaint.resident_id,
        status="PENDING",
        idempotency_key=f"STATUS_CHANGE:{history.id}"
    )
    db.add(notification)
    db.commit()
    db.refresh(complaint)

    # Queue async email notification via Celery
    try:
        resident = db.query(User).filter(User.id == complaint.resident_id).first()
        if resident and resident.email:
            status_str = new_status.value if hasattr(new_status, 'value') else str(new_status)
            cat_str = complaint.category.value if hasattr(complaint.category, 'value') else str(complaint.category)
            
            subject = f"Complaint {complaint.complaint_number} updated to {status_str}"
            html_body = f"""
            <h2>Society Maintenance Ticket Update</h2>
            <p><strong>Complaint ID:</strong> {complaint.complaint_number}</p>
            <p><strong>Category:</strong> {cat_str}</p>
            <p><strong>Status:</strong> {status_str}</p>
            <p><strong>Note:</strong> {payload.note or 'No notes attached.'}</p>
            <hr/>
            <p>Login to your resident dashboard to view live updates.</p>
            """
            from app.modules.notifications.service import send_notification_email_async
            send_notification_email_async(notif_id, resident.email, subject, html_body)
    except Exception as exc:
        print(f"Error queueing email notification: {exc}")

    return complaint

def update_complaint_priority(db: Session, complaint_id: str, payload: PriorityUpdate) -> Complaint:
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    complaint.priority = payload.priority
    complaint.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(complaint)
    return complaint