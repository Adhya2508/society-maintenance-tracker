from sqlalchemy import Column, String, DateTime, Integer, Text, func
from app.database.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    type = Column(String, nullable=False) # e.g. STATUS_CHANGE, IMPORTANT_NOTICE
    recipient_id = Column(String, nullable=False, index=True)
    status = Column(String, default="PENDING", nullable=False) # PENDING, SENT, FAILED
    attempts = Column(Integer, default=0)
    idempotency_key = Column(String, unique=True, index=True, nullable=False)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())