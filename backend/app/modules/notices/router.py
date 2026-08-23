from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.database.models.user import User
from app.modules.auth.dependencies import get_current_user, get_current_admin
from app.modules.notices.schemas import NoticeCreate, NoticeResponse
from app.modules.notices.service import create_notice, get_all_notices

router = APIRouter(prefix="/api", tags=["Notices"])

@router.get("/notices", response_model=List[NoticeResponse])
def list_notices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return get_all_notices(db)

@router.post("/admin/notices", response_model=NoticeResponse)
def post_notice(payload: NoticeCreate, db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    return create_notice(db, payload)