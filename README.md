# 🏢 Greenview Heights — Society Maintenance Tracker

[![Live Demo](https://img.shields.io/badge/🌐%20Live%20Demo-Visit%20App-0070F3?style=for-the-badge)](https://society-maintenance-tracker-dusky.vercel.app)
[![YouTube](https://img.shields.io/badge/📺%20Video%20Demo-Watch%20on%20YouTube-FF0000?style=for-the-badge)](https://youtu.be/Mrlt2Wc0yrI?si=z0mIoQl6j55xNxCW)
[![API Docs](https://img.shields.io/badge/⚡%20API%20Docs-Swagger%20UI-009688?style=for-the-badge)](https://society-maintenance-tracker-8y4e.onrender.com/api/docs)

> A modern, full-stack complaint management and community notice portal for residential housing societies.  
> Built with **Next.js 16**, **FastAPI**, **PostgreSQL 15**, **Supabase Storage**, and **Resend**.

---

## 🚀 Deployment Links

> 🌐 **Live Application:** **[https://society-maintenance-tracker-dusky.vercel.app](https://society-maintenance-tracker-dusky.vercel.app)**  
> 📺 **Full Video Walkthrough:** **[https://youtu.be/Mrlt2Wc0yrI?si=z0mIoQl6j55xNxCW](https://youtu.be/Mrlt2Wc0yrI?si=z0mIoQl6j55xNxCW)**  
> ⚡ **Backend API Docs (Swagger):** **[https://society-maintenance-tracker-8y4e.onrender.com/api/docs](https://society-maintenance-tracker-8y4e.onrender.com/api/docs)**

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@society.com` | `DemoAdmin123!` |
| **Resident** | `ravi@society.com` | `DemoResident123!` |
| **Resident 2** | `priya@society.com` | `DemoResident123!` |

---

## 🏛️ System Architecture

![Architecture Diagram](./Video%20walkthrough%20and%20screenshots/architecture%20diagram.png)

**Modular Monolith Architecture** — Next.js frontend (Vercel) calls a FastAPI backend (Render), which connects to managed PostgreSQL for data, Supabase Storage for complaint photos, and Resend for transactional email notifications.

> 📄 See [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md) for the full 800-word technical design specification.

---

## 📸 Feature Walkthrough

### 1. Modern Landing Page
A premium, animated community landing page showcasing amenities (pool, gym, sports courts), society stats, and a resident login portal.

![Front Page](./Video%20walkthrough%20and%20screenshots/front%20page.png)

---

### 2. Role-Based Login Portal
Dual-mode sign-in: choose **Admin** (society management) or **Resident** (my complaints & feed). Demo credentials auto-fill on role selection.

![Login Portal](./Video%20walkthrough%20and%20screenshots/login%20portal.png)

---

### 3. Admin Complaint Management Dashboard
Admins view all society complaints across residents in a filterable table. They can assign priority, change status (`OPEN` → `IN_PROGRESS` → `RESOLVED`), leave resolution comments, and track SLA overdue items highlighted in red.

![Admin Manages Complaints](./Video%20walkthrough%20and%20screenshots/admin%20manages%20complaints.png)

---

### 4. Resident Complaint Submission & Tracking
Residents file new complaints with category, priority, description, and optional photo upload. They can track the live status and full resolution history of all their submitted complaints.

![User Complaints](./Video%20walkthrough%20and%20screenshots/user%20complaints.png)

---

### 5. Community Notice Board
Admins broadcast society-wide announcements. Notices flagged as `Important` are pinned at the top with a high-visibility banner. Residents see all active notices on their dashboard feed.

![Notice Board](./Video%20walkthrough%20and%20screenshots/notice%20board.png)

---

### 6. Secure Supabase Cloud Photo Storage
Complaint photos are securely stored in a private Supabase S3 bucket. The backend generates **1-hour signed URLs** per request — leaked links auto-expire. Photos are never stored inside PostgreSQL.

![Supabase Complaint Images](./Video%20walkthrough%20and%20screenshots/supabase%20complaint%20images.png)

---

### 7. Automated Email Notifications
When a complaint's status changes, the resident automatically receives a transactional email via the **Resend API**. Emails are dispatched asynchronously in background threads so the UI never blocks waiting for delivery.

![Timely Email Updates](./Video%20walkthrough%20and%20screenshots/timely%20email%20updates.png)

---

## ✨ Feature Summary

| Feature | Details |
|---|---|
| **Role-Based Access Control** | Separate Admin and Resident portals with JWT-secured endpoints |
| **Complaint Lifecycle** | `OPEN → IN_PROGRESS → RESOLVED` with full immutable audit history |
| **Overdue Detection** | Dynamic SLA engine flags unresolved complaints past threshold (configurable) |
| **Priority Management** | `LOW`, `MEDIUM`, `HIGH` with admin triage and sorting |
| **Photo Uploads** | Private Supabase S3 bucket with 1-hour signed URL delivery |
| **Community Notices** | Pinned important broadcasts visible across all resident dashboards |
| **Email Notifications** | Auto-triggered on status changes via Resend (async, non-blocking) |
| **Admin Analytics** | Dashboard with category, priority, and SLA overdue breakdowns |
| **API Documentation** | Auto-generated Swagger/OpenAPI UI at `/api/docs` |

---

## 🧩 What This Solves

Residential societies struggle with:
- **No tracking** — complaints reported verbally get lost immediately.
- **No accountability** — nobody knows who owns a complaint or what stage it's at.
- **No history** — once resolved, there is zero record of what happened or who fixed it.
- **No transparency** — residents have no visibility into their complaint's status.
- **No communication** — residents are never notified when their issue is acted on.

**This system solves all five.** Every complaint has a structured lifecycle, an immutable audit trail, a priority rating, an overdue alarm, and automated email notifications at every state change.

---

> 📄 For full technical deep-dives on Complaint Lifecycle, Overdue Detection, Photo Upload, Notification Flow, Database Schema, and API Design — see **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)**

---

## 📊 Dashboard & Reporting

![Admin Manages Complaints](./Video%20walkthrough%20and%20screenshots/admin%20manages%20complaints.png)

The admin dashboard delivers aggregated live metrics from the database on every page load:

| Metric Card | Description |
|---|---|
| **Total Complaints** | All complaints ever filed across all residents |
| **Active Complaints** | Complaints in `OPEN` or `IN_PROGRESS` state |
| **Pending Notices** | All currently active notice board items |
| **Overdue Tickets** | Unresolved complaints past the SLA threshold |

**Breakdown Views:**
- **By Category** — how complaints are distributed across Plumbing, Electrical, Security, Cleaning, Other.
- **By Priority** — Low / Medium / High distribution for workload triage.
- **By Status** — OPEN vs IN_PROGRESS live split.

All metrics use SQLAlchemy aggregate queries (`func.count()`, `GROUP BY`) — zero N+1 queries, no separate analytics database needed.

---

## 🗄️ Database Schema, API Design & Documentation

### Database Schema

```sql
users (
  id UUID PK, name, email UNIQUE, password_hash [Argon2],
  role ENUM('ADMIN','RESIDENT'), created_at
)

complaints (
  id UUID PK, resident_id FK → users,
  title, description, category ENUM, priority ENUM,
  status ENUM('OPEN','IN_PROGRESS','RESOLVED'),
  photo_path VARCHAR,   -- Supabase relative path only
  created_at, updated_at
)

complaint_history (
  id UUID PK, complaint_id FK → complaints,
  old_status, new_status, comment, changed_at
)

notices (
  id UUID PK, title, content, is_important BOOLEAN, created_at
)

system_settings (
  id VARCHAR PK DEFAULT 'default', overdue_days INTEGER DEFAULT 7
)
```

### REST API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a resident account |
| `POST` | `/api/auth/login` | Public | Returns JWT access token |
| `GET` | `/api/auth/me` | Auth | Current user profile |
| `POST` | `/api/complaints` | Resident | File new complaint + photo upload |
| `GET` | `/api/complaints` | Auth | List complaints (scoped by role) |
| `GET` | `/api/complaints/{id}` | Auth | Detail + history + signed photo URL |
| `PATCH` | `/api/complaints/{id}` | Admin | Update status / priority / comment |
| `GET` | `/api/notices` | Auth | List all notices |
| `POST` | `/api/notices` | Admin | Create a notice |
| `DELETE` | `/api/notices/{id}` | Admin | Delete a notice |
| `GET` | `/api/admin/dashboard` | Admin | Live aggregated metrics |
| `GET/PUT` | `/api/settings` | Admin | View/update SLA overdue threshold |

**Design Principles:**
- JWT Bearer authentication on all protected routes via FastAPI `Depends()` injection.
- Role guard middleware — admin endpoints return `403 Forbidden` for resident tokens.
- Pydantic v2 request validation with structured error messages (422 Unprocessable Entity).
- Consistent HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found).
- **Interactive Swagger UI** at [`/api/docs`](https://society-maintenance-tracker-8y4e.onrender.com/api/docs) — every endpoint is testable directly in the browser.

---



## 💻 Tech Stack

```
Frontend:   Next.js 16 · App Router · TypeScript · Tailwind CSS · Lucide Icons · Axios
Backend:    FastAPI · Uvicorn · SQLAlchemy 2.0 · Alembic · Pydantic v2 · Argon2 · JWT (HS256)
Database:   PostgreSQL 15 — Render Managed (ACID, relational integrity)
Storage:    Supabase Storage — Private S3 bucket, signed URL delivery
Email:      Resend Transactional API (background thread dispatch)
Auth:       JWT Bearer Tokens · Argon2 Password Hashing · RBAC Dependency Injection
Deployment: Vercel (Frontend) · Render Docker Web Service (Backend + DB)
```

---

## 🛠️ Setup Guide

### Option 1 — Docker Compose (Recommended, Zero Config)

Runs the entire stack (frontend + backend + PostgreSQL) locally with a single command.

```bash
git clone https://github.com/Adhya2508/society-maintenance-tracker.git
cd society-maintenance-tracker
```

Copy the environment file and fill in your credentials (see [Environment Variables](#-environment-variables) below):
```bash
cp .env.example backend/.env
```

Start all services:
```bash
docker-compose up --build
```

| Service | Local URL |
|---|---|
| 🌐 **Frontend** | http://localhost:3000 |
| ⚡ **Backend API** | http://localhost:8002 |
| 📖 **API Docs (Swagger)** | http://localhost:8002/api/docs |

The database is automatically migrated and seeded with demo data on first run.

---

### Option 2 — Manual Setup

#### Step 1 — Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp ../.env.example .env
# Edit .env and fill in your DATABASE_URL, SECRET_KEY, Supabase, and Resend keys

# Run database migrations
alembic upgrade head

# Seed demo data (creates admin + sample residents, complaints, notices)
python seed.py

# Start the API server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Step 2 — Frontend

```bash
cd frontend

# Install Node dependencies
npm install

# Configure backend URL
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000' > .env.local

# Start Next.js dev server
npm run dev
```

Frontend will be available at **http://localhost:3000**.

---

## ⚙️ Environment Variables

All variables are defined in `.env.example` at the project root. Copy it to `backend/.env` and fill in real values.

### Database

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string (psycopg2 driver) | `postgresql+psycopg2://user:pass@host/db` |

> **Render Tip:** Use the **Internal Database URL** from your Render PostgreSQL dashboard (not the external one) to avoid connection timeouts.

### Security

| Variable | Description | How to Generate |
|---|---|---|
| `SECRET_KEY` | JWT signing key (HS256) | `python -c "import secrets; print(secrets.token_hex(32))"` |

### Supabase Storage

Create a project at [supabase.com](https://supabase.com) → Storage → New Bucket → set to **Private**.

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your project URL from Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (NOT anon key) from Settings → API |
| `SUPABASE_STORAGE_BUCKET` | Name of the private bucket (e.g. `complaint-photos`) |

### Email (Resend)

Sign up at [resend.com](https://resend.com) → API Keys → Create Key.

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Your Resend API key (`re_xxxx...`) |
| `EMAIL_FROM` | Verified sender address or `onboarding@resend.dev` for testing |

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full URL of the backend API (`https://your-api.onrender.com` or `http://localhost:8000`) |

**Complete `.env.example`:**

```env
# ── DATABASE ──────────────────────────────────────────────────
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/society_db

# ── SECURITY ──────────────────────────────────────────────────
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# ── SUPABASE STORAGE ──────────────────────────────────────────
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=complaint-photos

# ── EMAIL (Resend) ─────────────────────────────────────────────
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev

# ── FRONTEND ───────────────────────────────────────────────────
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## 📖 API Documentation

Full interactive API documentation is auto-generated by FastAPI and available at:

> 🔗 **[https://society-maintenance-tracker-8y4e.onrender.com/api/docs](https://society-maintenance-tracker-8y4e.onrender.com/api/docs)**  
> (Locally: http://localhost:8002/api/docs)

All endpoints are organized by module:

### Auth Module (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | None | Register a new resident account |
| `POST` | `/api/auth/login` | None | Authenticate and receive a JWT token |
| `GET` | `/api/auth/me` | Bearer | Get current authenticated user profile |

### Complaints Module (`/api/complaints`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/complaints` | Resident | Submit a new complaint (multipart with optional photo) |
| `GET` | `/api/complaints` | Both | List complaints — residents see own, admins see all |
| `GET` | `/api/complaints/{id}` | Both | Full detail: complaint + history timeline + signed photo URL |
| `PATCH` | `/api/complaints/{id}` | Admin | Update status, priority, or leave a resolution comment |

### Notices Module (`/api/notices`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/notices` | Both | List all notices (important ones first) |
| `POST` | `/api/notices` | Admin | Create a new society notice |
| `DELETE` | `/api/notices/{id}` | Admin | Delete a notice |

### Admin & Settings
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | Aggregated metrics: totals, categories, overdue count |
| `GET` | `/api/settings` | Admin | View current SLA configuration |
| `PUT` | `/api/settings` | Admin | Update `overdue_days` SLA threshold |
| `GET` | `/health` | None | Service liveness check |

---

## 📂 Project Structure

```
society-maintenance-tracker/
│
├── Video walkthrough and screenshots/   # UI screenshots & architecture diagram
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py       # Pydantic settings loader (reads .env)
│   │   │   └── security.py     # JWT creation/decoding, Argon2 hashing
│   │   ├── database/
│   │   │   ├── models/         # SQLAlchemy ORM models (user, complaint, notice...)
│   │   │   └── session.py      # DB engine + SessionLocal factory
│   │   ├── infrastructure/
│   │   │   ├── storage.py      # Supabase upload + signed URL generation
│   │   │   └── email.py        # Resend email dispatch (background thread)
│   │   └── modules/
│   │       ├── auth/           # register, login, JWT dependency
│   │       ├── complaints/     # CRUD, status transitions, photo handling
│   │       ├── notices/        # Notice CRUD
│   │       ├── dashboard/      # Aggregated admin stats
│   │       └── settings/       # SLA overdue_days config
│   ├── alembic/                # Auto-generated migration scripts
│   ├── Dockerfile              # Container definition (migrate + seed + serve)
│   ├── seed.py                 # Demo data seeder (auto-runs if DB empty)
│   └── requirements.txt
│
├── frontend/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page
│   │   ├── login/              # Role-based sign in
│   │   ├── admin/              # Admin dashboard + complaint management
│   │   └── resident/           # Resident portal + complaint filing
│   ├── components/             # Shared UI components
│   ├── lib/
│   │   ├── api.ts              # Axios instance with JWT interceptor
│   │   └── auth.tsx            # Auth context + protected route wrapper
│   └── public/                 # Static images (amenity photos)
│
├── .env.example                # Template for all required environment variables
├── docker-compose.yml          # Multi-service local dev orchestration
├── SYSTEM_DESIGN.md            # 800-word technical system design doc
└── README.md
```

---

## 📄 License
Built with ❤️ using Next.js & FastAPI for modern residential community management.
