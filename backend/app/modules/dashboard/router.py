from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models.user import User
from app.modules.auth.dependencies import get_current_admin
from app.modules.dashboard.schemas import DashboardMetricsResponse
from app.modules.dashboard.service import get_dashboard_metrics

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"])

@router.get("/dashboard", response_model=DashboardMetricsResponse)
def get_dashboard(db: Session = Depends(get_db), current_admin: User = Depends(get_current_admin)):
    return get_dashboard_metrics(db)