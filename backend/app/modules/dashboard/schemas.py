from pydantic import BaseModel
from typing import Dict

class DashboardMetricsResponse(BaseModel):
    total: int
    open: int
    in_progress: int
    resolved: int
    overdue: int
    by_category: Dict[str, int]
    by_priority: Dict[str, int]