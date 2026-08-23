from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.modules.auth.router import router as auth_router
from app.modules.complaints.router import router as complaints_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.notices.router import router as notices_router
from app.modules.settings.router import router as settings_router
from app.database.session import get_db
from fastapi import Depends
from sqlalchemy.orm import Session
import redis as redis_client
import os

app = FastAPI(title="Society Maintenance Tracker API", docs_url="/api/docs", redoc_url="/api/redoc")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(complaints_router)
app.include_router(dashboard_router)
app.include_router(notices_router)
app.include_router(settings_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    # Check DB
    try:
        db.execute(__import__('sqlalchemy').text("SELECT 1"))
    except Exception as e:
        return {"status": "error", "detail": f"DB: {str(e)}"}
    # Check Redis
    try:
        r = redis_client.from_url(os.getenv("REDIS_URL", "redis://localhost:6379/0"))
        r.ping()
    except Exception as e:
        return {"status": "error", "detail": f"Redis: {str(e)}"}
    return {"status": "ok", "postgres": True, "redis": True}