from pydantic import BaseModel, Field

class SettingUpdate(BaseModel):
    overdue_days: int = Field(..., ge=1, le=365)

class SettingResponse(BaseModel):
    id: str
    overdue_days: int

    class Config:
        from_attributes = True