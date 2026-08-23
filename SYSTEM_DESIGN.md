# System Design — Society Maintenance Tracker

## Overview

A full-stack complaint and notice management platform for residential societies. Residents file and track maintenance complaints; admins resolve and broadcast notices. Built as a modular monolith for simplicity and fast deployment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL 15 via SQLAlchemy ORM |
| Migrations | Alembic |
| Auth | JWT (HS256, 24h expiry) |
| File Storage | Supabase Storage (private bucket) |
| Email | Resend API |
| Background Tasks | Python `threading.Thread` (no Redis/Celery needed) |
| Containerization | Docker + Docker Compose |
| Deployment | Render (backend) + Vercel (frontend) |

---

## Architecture

```
[Browser]
    │
    │ HTTPS REST/JSON
    ▼
[Vercel] ── Next.js 16 ── Axios client
    │
    │ HTTPS API calls
    ▼
[Render] ── FastAPI (Uvicorn)
    ├── Auth Module          (JWT issue / verify)
    ├── Complaints Module    (CRUD + status lifecycle)
    ├── Notices Module       (CRUD + importance flag)
    ├── Dashboard Module     (aggregated stats)
    └── Settings Module      (SLA config)
    │
    ├── PostgreSQL (Render Managed DB)
    ├── Supabase Storage (private photo bucket)
    └── Resend API (transactional email)
```

All modules live in a single FastAPI process. No microservices. No message broker.

---

## Core Design Decisions

### 1. Role-Based Access Control (RBAC)
Two roles: `ADMIN` and `RESIDENT`. Every protected route uses a `get_current_user` FastAPI dependency that decodes the JWT and validates the role. Admin-only endpoints return `403 Forbidden` for residents. Complaint visibility is scoped: residents only see their own complaints; admins see all.

### 2. Complaint Lifecycle State Machine
Complaints follow a strict linear state machine:

```
OPEN → IN_PROGRESS → RESOLVED
```

Status transitions are only allowed in the forward direction and only by admins. Each transition is recorded in a `ComplaintHistory` table with a timestamp and optional admin comment, providing a full immutable audit trail.

### 3. Photo Storage — Supabase Signed URLs
Photos are never stored in PostgreSQL (avoids BLOB bloat and slow queries). On upload:
1. FastAPI validates MIME type and enforces a 5MB size limit.
2. File is pushed to a **private** Supabase Storage bucket at path `complaints/{complaint_id}/{uuid}.jpg`.
3. Only the relative path is persisted in PostgreSQL.
4. On retrieval, the backend generates a **1-hour signed URL** via the Supabase SDK. Leaked URLs auto-expire.

If the PostgreSQL transaction fails after a successful Supabase upload, the orphaned file is deleted from storage to prevent bloat.

### 4. Background Email Notifications
When a complaint status changes, the resident receives an email. Email dispatch runs in a **background thread** (`threading.Thread`) — decoupled from the HTTP response cycle so the API responds instantly without waiting for Resend. The hybrid design detects `REDIS_URL` in the environment: if present, it uses Celery workers; if absent, it falls back to threads. This allows free-tier cloud deployment without a Redis instance.

### 5. Database Schema
Five tables with relational integrity:

- **users** — id, name, email, password_hash, role (`ADMIN`/`RESIDENT`)
- **complaints** — id, resident_id (FK), title, category, priority, status, photo_path, created_at
- **complaint_history** — id, complaint_id (FK), old_status, new_status, comment, changed_at
- **notices** — id, title, content, is_important, created_at
- **system_settings** — id (`default`), overdue_days (SLA threshold)

### 6. Authentication Flow
1. Client POSTs `{email, password}` to `/api/auth/login`.
2. Backend hashes password with `argon2` and compares against stored hash.
3. On match, a signed JWT is returned with `{"sub": user_id, "exp": +24h}`.
4. All subsequent requests send `Authorization: Bearer <token>`.
5. `get_current_user` dependency decodes the token and injects the `User` model into the route.

### 7. SLA Overdue Detection
`SystemSetting.overdue_days` defines the SLA window. The dashboard module dynamically computes overdue complaints at query time: `status != RESOLVED AND created_at < NOW() - INTERVAL '{overdue_days} days'`. No background scheduler needed — overdue status is derived on read, not stored.

---

## Deployment

- **Backend**: Render Web Service (Docker language, Root Directory: `backend`). On container startup: `alembic upgrade head && python seed.py && uvicorn app.main:app`.
- **Frontend**: Vercel (Next.js preset, Root Directory: `frontend`). Single env var: `NEXT_PUBLIC_API_URL`.
- **Database**: Render Managed PostgreSQL (free tier, 1GB).
- **No Redis, No Celery worker needed** — thread-based fallback handles email in production.
