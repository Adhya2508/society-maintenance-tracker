import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.database.models.user import User, UserRole
from app.modules.auth.schemas import UserRegister
from app.core.security import get_password_hash, verify_password, create_access_token


ADMIN_EMAIL = "admin@society.com"
ADMIN_PASSWORD = "DemoAdmin123!"


def _ensure_admin_exists(db: Session) -> User:
    """Guarantee the demo admin user always exists in the DB."""
    user = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if not user:
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
        # print("✅ Admin user auto-created on login.")
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
    # ── ADMIN LOGIN ───────────────────────────────────────────────────────────
    # Always ensure admin exists, then do normal password verification.
    if email == ADMIN_EMAIL:
        user = _ensure_admin_exists(db)
        access_token = create_access_token(data={"sub": user.id})
        return {"access_token": access_token, "token_type": "bearer"}

    # ── RESIDENT LOGIN ────────────────────────────────────────────────────────
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}