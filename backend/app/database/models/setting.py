from sqlalchemy import Column, Integer, String
from app.database.base import Base

class SystemSetting(Base):
    __tablename__ = "system_settings"

    id = Column(String, primary_key=True, default="default")
    overdue_days = Column(Integer, default=7, nullable=False)