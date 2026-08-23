# System Design — Greenview Heights Society Maintenance Tracker

![Architecture Diagram](Video%20walkthrough%20and%20screenshots/architecture%20diagram.png)

---

## 1. System Topology & Architecture

The application is structured as a **Modular Monolith** prioritizing maintainability, data consistency, and low-latency client-server interactions.

```
[Browser Client] ──(HTTPS)──► [Next.js 16 App Router on Vercel]
                                      │ (REST / JSON / Multipart)
                                      ▼
                             [FastAPI on Render]
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
   [PostgreSQL 15 (Render)]  [Supabase Storage]       [Resend API]
   (Relational Data / ACID)  (Private S3 Bucket)   (Transactional Email)
```

The backend is built with **FastAPI** running on Uvicorn, with logically isolated domain modules (Auth, Complaints, Notices, Dashboard, Settings). The frontend is a responsive **Next.js 16** single-page application hosted on Vercel.

---

## 2. Complaint Lifecycle & Status History Design

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
- **Access Control**: Only `ADMIN` roles can transition statuses or assign priorities.

**Audit Trail (`complaint_history` table):**

Every status change is **atomically written** to an append-only table alongside the complaint update:

```
Complaint #42 Timeline:
────────────────────────────────────────────────────────────────
[2024-03-15 10:32]  OPEN        → IN_PROGRESS  "Plumber dispatched"
[2024-03-15 14:55]  IN_PROGRESS → RESOLVED     "Pipe joint replaced, OK"
────────────────────────────────────────────────────────────────
```

Records: `old_status`, `new_status`, `comment`, `changed_at` — providing an immutable, chronological timeline visible to both residents and admins.

---

## 3. Overdue Detection & Priority Handling

**Priority Levels** (set by the resident at submission time):

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

- `overdue_days` is stored in `system_settings` and editable from the Admin Settings page — **no redeployment needed**.
- Overdue complaints are highlighted in red across all admin views.
- High-priority overdue complaints are surfaced first in the admin complaint queue.
- The dashboard stats card shows a live overdue count refreshed on every request.

---

## 4. Photo Upload & Notice Board Design

### Complaint Photo Upload

Photos are stored in **Supabase private cloud storage** — never as PostgreSQL BLOBs (which would destroy query performance):

1. Resident attaches a photo (JPEG/PNG, max 5MB) when submitting a complaint.
2. FastAPI validates MIME type and enforces the file size limit before any upload.
3. The file is stored at path `complaints/{complaint_id}/{uuid}.jpg` in a **private** Supabase S3 bucket.
4. Only the **relative path string** is saved in PostgreSQL — no binary data in the DB.
5. On retrieval, the backend generates a **1-hour signed URL** via Supabase SDK. Expired links auto-deny access.

![Supabase Complaint Images](Video%20walkthrough%20and%20screenshots/supabase%20complaint%20images.png)

**Rollback Safety:** If the PostgreSQL transaction fails after a Supabase upload, FastAPI catches the exception, rolls back the DB change, and fires a Supabase cleanup call to delete the orphaned file — preventing storage bloat.

### Notice Board Architecture

![Notice Board](Video%20walkthrough%20and%20screenshots/notice%20board.png)

Admins broadcast society-wide alerts with an `is_important` boolean flag:
- **Important notices** are pinned to the top of the feed with a high-visibility banner across all resident dashboards.
- Normal notices display in reverse-chronological order below pinned items.
- Residents see the full notice board directly on their home dashboard feed.

---

## 5. Notification Flow

When a complaint transitions state, automated email alerts are triggered:

```
[Status Change Triggered]
           │
           ▼
[Background Thread / Async Dispatcher] ──► [Resend API] ──► [Resident Inbox]
           │ (Fail-safe Fallback)
           ▼
[Notification Logged in DB]
```

- **Non-Blocking Execution**: Dispatched asynchronously using Python `threading.Thread`. This decouples third-party API latency (1–2s) from client HTTP response times (<50ms).
- **Hybrid Task Queue**: Natively supports Celery + Redis brokers on dedicated clusters; falls back to thread pools for zero-overhead serverless environments.

---

## 6. Dashboard & Reporting Engine

![Admin Manages Complaints](Video%20walkthrough%20and%20screenshots/admin%20manages%20complaints.png)

The Dashboard delivers high-throughput metrics via aggregated SQL queries:

| Metric Card | Description |
|---|---|
| **Total Complaints** | All complaints ever filed across all residents |
| **Active Complaints** | Complaints in `OPEN` or `IN_PROGRESS` state |
| **Pending Notices** | All currently active notice board items |
| **Overdue Tickets** | Unresolved complaints past the SLA threshold |

- **By Category**: Plumbing, Electrical, Security, Cleaning, Other — via `GROUP BY category`.
- **By Priority**: Low / Medium / High distribution for workload triage.
- All queries use SQLAlchemy `func.count()` + `GROUP BY` — zero N+1 queries.

---

## 7. Database Schema & API Design

### Schema

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

### API Design

- **Authentication**: Stateless JWT (`HS256`, 24-hour expiration) with Argon2 password hashing.
- **RBAC**: `get_current_user` FastAPI dependency injects role on every protected route. Admin endpoints return `403` for residents.
- **Validation**: Pydantic v2 schemas enforce all request shapes with structured 422 error messages.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate, returns JWT |
| `POST` | `/api/auth/register` | Public | Create resident account |
| `GET` | `/api/auth/me` | Auth | Current user profile |
| `POST` | `/api/complaints` | Resident | File complaint + optional photo |
| `GET` | `/api/complaints` | Both | List (scoped by role) |
| `GET` | `/api/complaints/{id}` | Both | Detail + history + signed URL |
| `PATCH` | `/api/complaints/{id}` | Admin | Update status / priority |
| `GET/POST/DELETE` | `/api/notices` | Both/Admin | Notice board CRUD |
| `GET` | `/api/admin/dashboard` | Admin | Aggregated live metrics |
| `GET/PUT` | `/api/settings` | Admin | SLA configuration |

- **Interactive Documentation**: Swagger UI auto-generated at `/api/docs`.
