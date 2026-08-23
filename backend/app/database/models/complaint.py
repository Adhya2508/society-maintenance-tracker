import enum
from sqlalchemy import Column, String, Enum, Text, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import relationship
from app.database.base import Base

class ComplaintStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"

class ComplaintPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class ComplaintCategory(str, enum.Enum):
    PLUMBING = "PLUMBING"
    ELECTRICAL = "ELECTRICAL"
    CLEANING = "CLEANING"
    SECURITY = "SECURITY"
    PARKING = "PARKING"
    OTHER = "OTHER"

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(String, primary_key=True, index=True)
    complaint_number = Column(String, unique=True, index=True, nullable=False)
    resident_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    category = Column(Enum(ComplaintCategory), nullable=False, index=True)
    description = Column(Text, nullable=False)
    photo_url = Column(String, nullable=True)
    status = Column(Enum(ComplaintStatus), default=ComplaintStatus.OPEN, nullable=False, index=True)
    priority = Column(Enum(ComplaintPriority), default=ComplaintPriority.MEDIUM, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    resident = relationship("User", foreign_keys=[resident_id])