import base64
import os
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.database.models.user import User, UserRole
from app.database.models.complaint import Complaint, ComplaintStatus, ComplaintCategory, ComplaintPriority
from app.modules.auth.dependencies import get_current_user, get_current_admin
from app.modules.complaints.schemas import (
    ComplaintCreate, ComplaintResponse, StatusUpdate, PriorityUpdate,
    ComplaintHistoryResponse, PaginatedComplaintsResponse
)
from app.modules.complaints.service import create_complaint, update_complaint_status, update_complaint_priority
from app.database.models.history import ComplaintHistory
from app.infrastructure.storage import upload_complaint_photo, get_signed_url
from app.core.config import settings
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api", tags=["Complaints"])

@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """Uploads an image to Supabase Storage (if configured) or returns a base64 Data URL fallback."""
    try:
        content = await file.read()
        
        # If Supabase keys are present, upload to Supabase Storage
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            storage_path = upload_complaint_photo(
                file_bytes=content,
                filename=file.filename or "photo.jpg",
                content_type=file.content_type or "image/jpeg"
            )
            signed_url = get_signed_url(storage_path)
            return {"url": signed_url, "storage_path": storage_path}
        else:
            # Universal data URL fallback for instant preview & storage without errors
            b64_str = base64.b64encode(content).decode("utf-8")
            mime_type = file.content_type or "image/jpeg"
            data_url = f"data:{mime_type};base64,{b64_str}"
            return {"url": data_url, "storage_path": data_url}
    except HTTPException as http_exc:
        raise http_exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(exc)}")

@router.post("/complaints", response_model=ComplaintResponse)
def raise_complaint(payload: ComplaintCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    complaint = create_complaint(db, payload, current_user.id)
    # Generate signed URL if photo_url is a Supabase storage path
    if complaint.photo_url:
        complaint.photo_url = get_signed_url(complaint.photo_url)
    return complaint

@router.get("/complaints", response_model=List[ComplaintResponse])
def get_my_complaints(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == UserRole.ADMIN:
        items = db.query(Complaint).order_by(Complaint.created_at.desc()).all()
    else:
        items = db.query(Complaint).filter(Complaint.resident_id == current_user.id).order_by(Complaint.created_at.desc()).all()
    
    out = []
    for c in items:
        resident = db.query(User).filter(User.id == c.resident_id).first()
        out.append({
            "id": c.id,
            "complaint_number": c.complaint_number,
            "resident_id": c.resident_id,
            "resident_name": resident.name if resident else "Unknown",
            "resident_email": resident.email if resident else "Unknown",
            "category": c.category,
            "description": c.description,
            "photo_url": get_signed_url(c.photo_url) if c.photo_url else None,
            "status": c.status,
            "priority": c.priority,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "resolved_at": c.resolved_at,
        })
    return out

@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
def get_complaint_details(complaint_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user.role != UserRole.ADMIN and complaint.resident_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this complaint")
    
    resident = db.query(User).filter(User.id == complaint.resident_id).first()
    photo_signed = get_signed_url(complaint.photo_url) if complaint.photo_url else None
    
    res_dict = {
        "id": complaint.id,
        "complaint_number": complaint.complaint_number,
        "resident_id": complaint.resident_id,
        "resident_name": resident.name if resident else "Unknown",
        "resident_email": resident.email if resident else "Unknown",
        "category": complaint.category,
        "description": complaint.description,
        "photo_url": photo_signed,
        "status": complaint.status,
        "priority": complaint.priority,
        "created_at": complaint.created_at,
        "updated_at": complaint.updated_at,
        "resolved_at": complaint.resolved_at,
    }
    return res_dict

@router.get("/complaints/{complaint_id}/history", response_model=List[ComplaintHistoryResponse])
def get_complaint_history(complaint_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    complaint = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if current_user.role != UserRole.ADMIN and complaint.resident_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    history = db.query(ComplaintHistory).filter(
        ComplaintHistory.complaint_id == complaint_id
    ).order_by(ComplaintHistory.created_at.asc()).all()
    result = []
    for h in history:
        actor = db.query(User).filter(User.id == h.actor_id).first()
        result.append({
            "id": h.id,
            "old_status": h.old_status,
            "new_status": h.new_status,
            "note": h.note,
            "created_at": h.created_at,
            "actor_id": h.actor_id,
            "actor_name": actor.name if actor else "Unknown",
            "actor_role": actor.role.value if actor else "RESIDENT",
        })
    return result

# ─── Admin Endpoints ─────────────────────────────────────────────────────────

@router.get("/admin/complaints", response_model=PaginatedComplaintsResponse)
def admin_list_complaints(
    status: Optional[ComplaintStatus] = None,
    category: Optional[ComplaintCategory] = None,
    priority: Optional[ComplaintPriority] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    q = db.query(Complaint)
    if status:
        q = q.filter(Complaint.status == status)
    if category:
        q = q.filter(Complaint.category == category)
    if priority:
        q = q.filter(Complaint.priority == priority)
    if search:
        q = q.filter(Complaint.complaint_number.ilike(f"%{search}%") | Complaint.description.ilike(f"%{search}%"))

    total = q.count()
    items = q.order_by(Complaint.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    # Calculate overdue_days from settings
    from app.database.models.setting import SystemSetting
    setting = db.query(SystemSetting).first()
    overdue_days = setting.overdue_days if setting else 7
    threshold = datetime.now(timezone.utc) - timedelta(days=overdue_days)

    complaints_out = []
    for c in items:
        resident = db.query(User).filter(User.id == c.resident_id).first()
        is_overdue = (c.status != ComplaintStatus.RESOLVED and c.created_at.replace(tzinfo=timezone.utc) < threshold)
        complaints_out.append({
            "id": c.id,
            "complaint_number": c.complaint_number,
            "resident_id": c.resident_id,
            "resident_name": resident.name if resident else "Unknown",
            "resident_email": resident.email if resident else "Unknown",
            "category": c.category,
            "description": c.description,
            "photo_url": get_signed_url(c.photo_url) if c.photo_url else None,
            "status": c.status,
            "priority": c.priority,
            "is_overdue": is_overdue,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "resolved_at": c.resolved_at,
        })
    return {
        "data": complaints_out,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": max(1, (total + limit - 1) // limit),
        },
    }

@router.patch("/admin/complaints/{complaint_id}/status", response_model=ComplaintResponse)
def admin_update_status(complaint_id: str, payload: StatusUpdate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    complaint = update_complaint_status(db, complaint_id, payload, current_admin.id)
    if complaint.photo_url:
        complaint.photo_url = get_signed_url(complaint.photo_url)
    return complaint

@router.patch("/admin/complaints/{complaint_id}/priority", response_model=ComplaintResponse)
def admin_update_priority(complaint_id: str, payload: PriorityUpdate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    complaint = update_complaint_priority(db, complaint_id, payload)
    if complaint.photo_url:
        complaint.photo_url = get_signed_url(complaint.photo_url)
    return complaint