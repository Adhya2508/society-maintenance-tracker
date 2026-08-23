from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict
from app.database.models.complaint import ComplaintCategory, ComplaintPriority, ComplaintStatus

class ComplaintCreate(BaseModel):
    category: ComplaintCategory
    description: str = Field(..., min_length=10, max_length=2000)
    priority: ComplaintPriority = ComplaintPriority.MEDIUM
    photo_url: Optional[str] = None

class StatusUpdate(BaseModel):
    status: ComplaintStatus
    note: Optional[str] = None

class PriorityUpdate(BaseModel):
    priority: ComplaintPriority

class ComplaintHistoryResponse(BaseModel):
    id: str
    old_status: Optional[str]
    new_status: str
    note: Optional[str]
    created_at: datetime
    actor_id: str
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None

    class Config:
        from_attributes = True

class ComplaintResponse(BaseModel):
    id: str
    complaint_number: str
    resident_id: str
    resident_name: Optional[str] = None
    resident_email: Optional[str] = None
    category: ComplaintCategory
    description: str
    photo_url: Optional[str]
    status: ComplaintStatus
    priority: ComplaintPriority
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        from_attributes = True

class AdminComplaintResponse(ComplaintResponse):
    is_overdue: bool = False

class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int

class PaginatedComplaintsResponse(BaseModel):
    data: List[AdminComplaintResponse]
    pagination: PaginationMeta