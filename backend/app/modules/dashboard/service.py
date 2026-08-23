from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.database.models.complaint import Complaint, ComplaintStatus
from app.database.models.setting import SystemSetting

def get_dashboard_metrics(db: Session):
    # Fetch system overdue threshold settings (default to 7 days if unconfigured)
    setting = db.query(SystemSetting).first()
    overdue_days = setting.overdue_days if setting else 7
    overdue_threshold = datetime.now(timezone.utc) - timedelta(days=overdue_days)

    complaints = db.query(Complaint).all()
    
    total = len(complaints)
    open_count = sum(1 for c in complaints if c.status == ComplaintStatus.OPEN)
    in_progress_count = sum(1 for c in complaints if c.status == ComplaintStatus.IN_PROGRESS)
    resolved_count = sum(1 for c in complaints if c.status == ComplaintStatus.RESOLVED)

    # Dynamic Overdue Calculation (Resolved complaints are never overdue)
    overdue_count = sum(
        1 for c in complaints 
        if c.status != ComplaintStatus.RESOLVED and c.created_at < overdue_threshold
    )

    by_category = {}
    by_priority = {}
    for c in complaints:
        cat = c.category.value
        pri = c.priority.value
        by_category[cat] = by_category.get(cat, 0) + 1
        by_priority[pri] = by_priority.get(pri, 0) + 1

    return {
        "total": total,
        "open": open_count,
        "in_progress": in_progress_count,
        "resolved": resolved_count,
        "overdue": overdue_count,
        "by_category": by_category,
        "by_priority": by_priority,
    }