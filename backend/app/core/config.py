import os
from pydantic_settings import BaseSettings

# Dynamically resolve DATABASE_URL with SQLAlchemy driver requirements
db_url = os.getenv("DATABASE_URL") or "postgresql+psycopg2://postgres:postgres@localhost:5435/society_db"
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

class Settings(BaseSettings):
    DATABASE_URL: str = db_url
    SECRET_KEY: str = os.getenv("SECRET_KEY") or "supersecretkeychangeineparation"
    REDIS_URL: str = os.getenv("REDIS_URL") or "redis://localhost:6379/0"
    
    # Resend Email Service
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY") or ""
    EMAIL_FROM: str = os.getenv("EMAIL_FROM") or "onboarding@resend.dev"
    
    # Supabase Storage Service
    SUPABASE_URL: str = os.getenv("SUPABASE_URL") or ""
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or ""
    SUPABASE_STORAGE_BUCKET: str = os.getenv("SUPABASE_STORAGE_BUCKET") or "complaint-photos"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()