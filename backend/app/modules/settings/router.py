from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.models.user import User
from app.database.session import get_db
from app.modules.auth.dependencies import get_current_admin
from app.modules.settings.schemas import SettingResponse, SettingUpdate
from app.modules.settings.service import get_system_settings, update_system_settings

router = APIRouter(prefix="/api/admin", tags=["Settings"])

@router.get("/settings", response_model=SettingResponse)
def read_settings(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    """Return the current system settings."""
    return get_system_settings(db)

@router.patch("/settings", response_model=SettingResponse)
def modify_settings(
    payload: SettingUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Update system settings (e.g., overdue_days)."""
    return update_system_settings(db, payload)
