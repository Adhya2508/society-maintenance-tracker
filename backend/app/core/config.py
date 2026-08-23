from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5435/society_db"
    SECRET_KEY: str = "supersecretkeychangeineparation"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Resend Email Service
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "onboarding@resend.dev"
    
    # Supabase Storage Service
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "complaint-photos"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()