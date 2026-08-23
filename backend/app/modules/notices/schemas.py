from pydantic import BaseModel, Field
from datetime import datetime

class NoticeCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=5, max_length=2000)
    is_important: bool = False

class NoticeResponse(BaseModel):
    id: str
    title: str
    content: str
    is_important: bool
    created_at: datetime

    class Config:
        from_attributes = True