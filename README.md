# Society Maintenance Tracker

A modular monolith web application designed for residential societies to track maintenance complaints, broadcast announcements, and monitor SLAs.

## Tech Stack

- **Frontend**: Next.js 16 (React 19), Tailwind CSS v4, Lucide Icons, Recharts, Axios, Zod
- **Backend**: FastAPI (Python 3.11), SQLAlchemy, Alembic, Pydantic v2
- **Database**: PostgreSQL
- **Task Queue & Cache**: Redis + Celery
- **Transactional Emails**: Resend API
- **Photo Storage**: Supabase Storage (Private `complaint-photos` bucket with short-lived signed URLs)
- **Containerization & CI/CD**: Docker Compose, GitHub Actions

---

## Architecture Overview

```
INTERNET
   │
   ├──► Next.js (TypeScript Frontend)
   │       │
   │       ▼
   ├──► FastAPI (Modular Monolith Backend)
   │       ├──────────────► PostgreSQL (Relational Database)
   │       ├──────────────► Supabase Storage (Private Complaint Photos)
   │       │
   │       ▼
   └────► Redis ──► Celery ──► Resend (Async Email Notifications)
```

### Photo Storage Security (Supabase Storage)

Complaint photos are stored in a private Supabase Storage bucket (`complaint-photos`). PostgreSQL stores only the object's relative storage path (e.g., `complaints/101/abc.jpg`). 

When an authorized resident or administrator requests a complaint, FastAPI verifies ownership/role-based access and generates a short-lived **signed URL** (valid for 1 hour). This prevents unauthorized direct access to resident property photos while keeping the database lightweight.

---

## Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### Required API Keys (100% Free Tiers)

1. **Supabase Storage**:
   - `SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key (used strictly on backend)
   - `SUPABASE_STORAGE_BUCKET`: `complaint-photos`
2. **Resend Email Service**:
   - `RESEND_API_KEY`: Your Resend API key (`re_...`)
   - `EMAIL_FROM`: `onboarding@resend.dev` (or verified domain)

---

## Quick Start (Docker)

1. Build and start all services:
   ```bash
   docker compose up --build -d
   ```

2. Seed demo database with 25 complaints and notices:
   ```bash
   docker exec society_api python seed.py
   ```

3. Open the app in your browser:
   - **Frontend**: http://localhost:3001
   - **API Docs**: http://localhost:8002/api/docs

---

## Demo Credentials

- **Admin Account**: `admin@society.com` / `DemoAdmin123!`
- **Resident Account**: `ravi@society.com` / `DemoResident123!`
