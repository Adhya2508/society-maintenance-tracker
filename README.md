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

## 🔄 Complaint Lifecycle & Status History Design

Each complaint progresses through a **strict, one-way state machine** enforced at the API layer:

```
  Resident Submits
       │
       ▼
   ┌──────┐    Admin Triages     ┌─────────────┐    Admin Resolves    ┌──────────┐
   │ OPEN │ ──────────────────► │ IN_PROGRESS │ ──────────────────► │ RESOLVED │
   └──────┘                     └─────────────┘                      └──────────┘
```

**How it works:**
- **Residents** submit a complaint with title, category, priority, description, and an optional photo.
- **Admins** view all complaints across all residents in a unified filterable table. They transition status and leave resolution comments.
- **Backward transitions are blocked** at the service layer — a resolved complaint cannot be accidentally reopened.

**Audit History (`complaint_history` table):**

Every status change is **atomically written** to an append-only `complaint_history` table:

```
Complaint #42 Timeline:
────────────────────────────────────────────────────────────────
[2024-03-15 10:32]  OPEN        → IN_PROGRESS  "Plumber dispatched"
[2024-03-15 14:55]  IN_PROGRESS → RESOLVED     "Pipe joint replaced, OK"
────────────────────────────────────────────────────────────────
```

Both residents and admins see the full audit trail on the complaint detail page — building full accountability and trust.

---

## ⏰ Overdue Detection & Priority Handling

**Priority Levels** (set by resident at submission time):

| Priority | Typical Use Case |
|---|---|
| `LOW` | Minor cosmetic issues (paint peeling, broken bulb) |
| `MEDIUM` | Service interruptions (water timer, elevator noise) |
| `HIGH` | Safety-critical issues (gas leak, electrical fault, flooding) |

**SLA Overdue Engine** — computed dynamically at query time, no background scheduler needed:

```sql
-- A complaint is flagged OVERDUE when:
status != 'RESOLVED'
AND (NOW() - created_at) > INTERVAL '{overdue_days} days'
```

- `overdue_days` is stored in `system_settings` and editable from the Admin Settings page — no redeployment needed.
- Overdue complaints are **highlighted in red** across all admin views.
- The dashboard stats card shows a live overdue count refreshed on every load.
- High-priority overdue complaints are surfaced first in the admin complaint queue.

---

## 🖼️ Photo Upload & Notice Board Design

### Complaint Photo Upload

Photos are stored in **Supabase private cloud storage** — never as PostgreSQL BLOBs (which would destroy DB performance):

1. Resident attaches a photo (JPEG/PNG, max 5MB) when submitting a complaint.
2. FastAPI validates MIME type and enforces the file size limit before any upload.
3. The file is stored at path `complaints/{complaint_id}/{uuid}.jpg` in a **private** Supabase S3 bucket.
4. Only the **relative path string** is saved in PostgreSQL — no binary data in the DB.
5. On complaint retrieval, the backend generates a **1-hour signed URL** via Supabase SDK. Expired links auto-deny access.

![Supabase Complaint Images](./Video%20walkthrough%20and%20screenshots/supabase%20complaint%20images.png)

**Rollback Safety:** If the PostgreSQL transaction fails after a Supabase upload, FastAPI catches the exception, rolls back the DB change, and fires a Supabase cleanup call to delete the orphaned file — preventing storage bloat.

### Notice Board

![Notice Board](./Video%20walkthrough%20and%20screenshots/notice%20board.png)

- Admins post society-wide announcements with title, content, and an `is_important` flag.
- **Important notices** are pinned to the top of the feed with a high-visibility banner across all resident dashboards.
- Normal notices display in reverse-chronological order below pinned items.
- Residents see the full notice board directly on their home dashboard feed.

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

## 🛠️ Local Development Setup

### Run with Docker (Fastest Path)
```bash
git clone https://github.com/Adhya2508/society-maintenance-tracker.git
cd society-maintenance-tracker
docker-compose up --build
```
| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8002 |
| **API Docs** | http://localhost:8002/api/docs |

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
python seed.py          # Seeds demo users, complaints, notices
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend
```bash
cd frontend
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm install && npm run dev
```

### Environment Variables (Backend)
```env
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/db
SECRET_KEY=your-jwt-secret-key
RESEND_API_KEY=re_xxxx
EMAIL_FROM=onboarding@resend.dev
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_STORAGE_BUCKET=complaint-photos
```

---

## 📂 Project Structure

```
society-maintenance-tracker/
├── Video walkthrough and screenshots/   # App screenshots & architecture diagram
├── backend/
│   ├── app/
│   │   ├── core/           # Config, security (JWT/Argon2)
│   │   ├── database/       # SQLAlchemy session + all models
│   │   ├── infrastructure/ # Supabase storage, Resend email
│   │   └── modules/        # auth, complaints, notices, dashboard, settings
│   ├── alembic/            # Database migration scripts
│   ├── Dockerfile
│   ├── seed.py             # Auto-seeds demo data if DB is empty
│   └── requirements.txt
├── frontend/
│   ├── app/                # Next.js App Router pages
│   ├── components/         # Reusable UI components
│   ├── lib/                # Axios API client + auth helpers
│   └── public/             # Static images
├── docker-compose.yml
├── SYSTEM_DESIGN.md        # 800-word technical architecture doc
└── README.md
```

---

## 📄 License
Built with ❤️ using Next.js & FastAPI for modern residential community management.
