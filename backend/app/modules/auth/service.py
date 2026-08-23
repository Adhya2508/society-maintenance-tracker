import uuid
import os
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.database.models.user import User, UserRole
from app.modules.auth.schemas import UserRegister
from app.core.security import get_password_hash, verify_password, create_access_token

# Hardcoded admin credentials — always accepted
ADMIN_EMAIL = "admin@society.com"
ADMIN_PASSWORD = "DemoAdmin123!"


def _ensure_admin_exists(db: Session) -> User:
    """Guarantee admin user always exists in DB. Creates it if missing."""
    user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if user:
        return user
    # Try to find any admin
    any_admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    if any_admin:
        return any_admin
    # Create fresh admin
    user = User(
        id=str(uuid.uuid4()),
        name="Admin User",
        email=ADMIN_EMAIL,
        password_hash=get_password_hash(ADMIN_PASSWORD),
        role=UserRole.ADMIN,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    print("✅ Admin user created on-the-fly during login.")
    return user


def register_user(db: Session, payload: UserRegister):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        id=str(uuid.uuid4()),
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(payload.password),
        role=payload.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str):
    # ── ADMIN FAST PATH ──────────────────────────────────────────────────────
    # Admin login: always succeeds with the known admin password.
    # Even if DB is empty, we create the admin on the spot and log them in.
    if email == ADMIN_EMAIL:
        if password == ADMIN_PASSWORD:
            admin = _ensure_admin_exists(db)
            access_token = create_access_token(data={"sub": admin.id})
            return {"access_token": access_token, "token_type": "bearer"}
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect admin password. Use: DemoAdmin123!",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # ── NORMAL USER LOGIN ─────────────────────────────────────────────────────
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}