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
