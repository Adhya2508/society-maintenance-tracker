from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from app.modules.auth.router import router as auth_router
from app.modules.complaints.router import router as complaints_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.notices.router import router as notices_router
from app.modules.settings.router import router as settings_router
from app.database.session import get_db, SessionLocal


def auto_seed():
    """Seed the database with demo data if it is empty. Safe to run on every startup."""
    try:
        import uuid
        from app.database.models.user import User, UserRole
        from app.database.models.setting import SystemSetting
        from app.core.security import get_password_hash

        db = SessionLocal()
        try:
            user_count = db.query(User).count()
            if user_count > 0:
                print(f"ℹ️  Database already has {user_count} users. Skipping seed.")
                return

            print("🌱 Empty database detected — seeding demo data...")

            # Settings
            db.add(SystemSetting(id="default", overdue_days=7))
            db.commit()

            # Admin user
            admin = User(
                id=str(uuid.uuid4()),
                name="Admin User",
                email="admin@society.com",
                password_hash=get_password_hash("DemoAdmin123!"),
                role=UserRole.ADMIN,
            )
            db.add(admin)

            # Demo residents
            for name, email in [
                ("Ravi Sharma", "ravi@society.com"),
                ("Priya Patel", "priya@society.com"),
                ("Amit Kumar", "amit@society.com"),
            ]:
                db.add(User(
                    id=str(uuid.uuid4()),
                    name=name,
                    email=email,
                    password_hash=get_password_hash("DemoResident123!"),
                    role=UserRole.RESIDENT,
                ))
            db.commit()
            print("✅ Demo users seeded successfully!")
            print("   Admin:    admin@society.com / DemoAdmin123!")
            print("   Resident: ravi@society.com  / DemoResident123!")
        finally:
            db.close()
    except Exception as e:
        print(f"⚠️  Auto-seed failed (non-fatal): {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    auto_seed()
    yield
    # Shutdown (nothing to clean up)


app = FastAPI(
    title="Society Maintenance Tracker API",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_origin_regex=r"https?://.*",
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
    try:
        db.execute(__import__('sqlalchemy').text("SELECT 1"))
        return {"status": "ok", "postgres": True}
    except Exception as e:
        return {"status": "error", "detail": f"DB: {str(e)}"}